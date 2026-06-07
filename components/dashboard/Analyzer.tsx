'use client'

import { useState, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import Tesseract from 'tesseract.js'
import { UploadCloud, FileText, CheckCircle2, Cpu, Loader2, ArrowDownCircle, ArrowUpCircle, TrendingUp, TrendingDown, DollarSign, PieChart, Search, AlertCircle, Lock, ArrowDown, Download } from 'lucide-react'
import { toast } from 'sonner'
import { SpendingChart } from './SpendingChart'
import { usePostHog } from 'posthog-js/react'

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

import { processExtractedText, ResultData, Transaction } from '@/lib/analyzer/parser'
export default function Analyzer() {
  const posthog = usePostHog()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isPdf, setIsPdf] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [saveToHistory, setSaveToHistory] = useState(true)
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'results'>('idle')
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const [resultData, setResultData] = useState<ResultData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortCol, setSortCol] = useState<'date' | 'particulars' | 'deposit' | 'withdrawal'>('date')
  const [sortAsc, setSortAsc] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 15

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pdfPassword, setPdfPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const passwordPromiseRef = useRef<{ resolve: (val: string | null) => void } | null>(null)

  const processFile = (file: File) => {
    setError(null)
    setResultData(null)
    setStatus('idle')
    setSearchTerm('')

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Please upload an image file or a PDF document.')
      setSelectedFile(null)
      return
    }

    const _isPdf = file.type === 'application/pdf'
    setIsPdf(_isPdf)
    setSelectedFile(file)
    
    if (!_isPdf) {
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return
    
    try {
      const usageRes = await fetch('/api/usage/check?t=' + Date.now(), { cache: 'no-store' })
      const usageData = await usageRes.json()
      if (usageData.allowed === false) {
        setError(`You have reached your limit of ${usageData.max} free analyses. Please upgrade your plan.`)
        return
      }
    } catch (err) {
      setError('Could not verify usage limits. Please try again.')
      return
    }

    setStatus('loading')
    setError(null)
    setProgress(5)
    setProgressText('Reading file...')

    posthog?.capture('analysis_started', {
      fileType: isPdf ? 'pdf' : 'image',
      fileSize: selectedFile.size
    })

    try {
      let extractedText = ""

      if (isPdf) {
        extractedText = await extractTextFromPDF(selectedFile)
      } else {
        extractedText = await extractTextFromImage(selectedFile)
      }

      setProgress(90)
      setProgressText('Analyzing transactions...')
      
      const data = processExtractedText(extractedText)
      setResultData(data)
      setStatus('results')
      
      posthog?.capture('analysis_completed', {
        fileType: isPdf ? 'pdf' : 'image',
        transactionCount: data.transactions.length,
        totalDeposits: data.totalDeposits,
        totalWithdrawals: data.totalWithdrawals
      })
      
      await fetch('/api/usage/check', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment' })
      })
      window.dispatchEvent(new Event('usageUpdated'))

      // Save to History conditionally
      if (saveToHistory) {
        try {
          await fetch('/api/analyses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: selectedFile.name,
              totalDeposits: data.totalDeposits,
              totalWithdrawals: data.totalWithdrawals,
              transactionCount: data.transactions.length
            })
          })
          toast.success('Analysis saved to History')
        } catch (err) {
          console.error('Failed to save history', err)
        }
      }
    } catch (err: any) {
      setStatus('idle')
      setError(err.message || 'Error processing file.')
      console.error(err)
    }
  }

  const extractTextFromPDF = async (file: File): Promise<string> => {
    let pdf: any = null
    let password = ''
    let isRetry = false
    
    while (!pdf) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        pdf = await pdfjsLib.getDocument({
          data: arrayBuffer,
          password: password
        }).promise
      } catch (error: any) {
        if (error.name === 'PasswordException') {
          setStatus('idle')
          
          const userPassword = await new Promise<string | null>((resolve) => {
            setShowPasswordModal(true)
            setPasswordError(isRetry)
            passwordPromiseRef.current = { resolve }
          })
          
          if (userPassword === null) {
            throw new Error("Password entry cancelled. Cannot read PDF.")
          }
          
          password = userPassword
          isRetry = true
          setStatus('loading')
          setProgress(5)
          setProgressText('Unlocking document...')
        } else {
          throw error
        }
      }
    }

    let fullText = ''
    setProgress(20)
    setProgressText('Extracting text from PDF pages...')

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      
      let linesObj: Record<number, any[]> = {}
      textContent.items.forEach((item: any) => {
        const y = Math.round(item.transform[5] / 3) * 3
        if (!linesObj[y]) linesObj[y] = []
        linesObj[y].push(item)
      })
      
      const sortedY = Object.keys(linesObj).map(Number).sort((a,b) => b - a)
      for (let y of sortedY) {
        linesObj[y].sort((a: any, b: any) => a.transform[4] - b.transform[4])
        const lineStr = linesObj[y].map(item => item.str).join(' ')
        fullText += lineStr + '\n'
      }
      
      setProgress(20 + ((i / pdf.numPages) * 60))
      setProgressText(`Extracting page ${i}...`)
    }
    return fullText
  }

  const extractTextFromImage = async (file: File): Promise<string> => {
    setProgress(10)
    setProgressText('Initializing Local OCR Engine...')
    
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          const p = 20 + (m.progress * 60)
          setProgress(p)
          setProgressText('Reading characters from image...')
        }
      }
    })

    const { data: { text } } = await worker.recognize(file)
    await worker.terminate()
    
    return text
  }


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0)
  }

  const getFilteredAndSortedTransactions = () => {
    if (!resultData) return []
    const term = searchTerm.toLowerCase()
    let filtered = resultData.transactions.filter(tx => 
        (tx.particulars && tx.particulars.toLowerCase().includes(term)) ||
        (tx.date && tx.date.includes(term))
    )

    filtered.sort((a: any, b: any) => {
        let valA = a[sortCol]
        let valB = b[sortCol]
        if (sortCol === 'date') {
            const parseDate = (d: string) => {
                const parts = d.match(/(\d{2})[-/\.](\d{2})[-/\.](\d{2,4})/)
                if (parts) {
                    const year = parts[3].length === 2 ? `20${parts[3]}` : parts[3]
                    return new Date(`${year}-${parts[2]}-${parts[1]}`).getTime()
                }
                return new Date(d).getTime() || 0
            }
            valA = parseDate(a.date)
            valB = parseDate(b.date)
        }
        if (valA < valB) return sortAsc ? -1 : 1
        if (valA > valB) return sortAsc ? 1 : -1
        return 0
    })
    return filtered
  }

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortAsc(!sortAsc)
    else {
      setSortCol(col)
      setSortAsc(col === 'particulars')
    }
  }

  const exportCSV = () => {
    if (!resultData) return
    posthog?.capture('export_csv_clicked', {
      transactionCount: resultData.transactions.length
    })
    const headers = ['Date', 'Particulars', 'Deposits (In)', 'Withdrawals (Out)']
    const rows = getFilteredAndSortedTransactions().map(tx => [
      tx.date,
      `"${tx.particulars.replace(/"/g, '""')}"`,
      tx.deposit || 0,
      tx.withdrawal || 0
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `statement_export_${new Date().getTime()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="glass-card p-6 rounded-2xl">
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
          <AlertCircle className="shrink-0 mt-0.5 w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {status === 'idle' && (
        <div id="upload-section">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 scale-[1.02]' : selectedFile ? 'border-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-700' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*,application/pdf" 
              className="hidden" 
              onChange={handleFileChange}
            />
            
            {!selectedFile ? (
              <div className="space-y-4 py-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-colors duration-300 ${isDragging ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'}`}>
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    {isDragging ? 'Drop your file here!' : 'Click or drag and drop to upload'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Supports PDF, JPG, PNG</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {isPdf ? (
                  <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm w-full max-w-sm mx-auto h-48">
                    <FileText className="w-12 h-12 text-red-500 mb-2" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate w-full px-4 text-center">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF Document Selected</p>
                  </div>
                ) : (
                  <div className="relative w-full max-w-sm mx-auto h-48 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                    {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-full object-cover object-top" />}
                  </div>
                )}
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> File loaded successfully
                </p>
                <p className="text-xs text-slate-500">Click to change file</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            <button 
              disabled={!selectedFile}
              onClick={handleAnalyze}
              className={`px-8 py-3 rounded-full font-semibold shadow-sm transition-all flex items-center gap-2 ${selectedFile ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'}`}
            >
              <Cpu className="w-5 h-5" />
              Analyze Locally
            </button>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              <input 
                type="checkbox" 
                checked={saveToHistory}
                onChange={(e) => setSaveToHistory(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Save summary to History
            </label>
          </div>
        </div>
      )}

      {status === 'loading' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mt-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="font-medium text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{progressText}</span>
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{Math.floor(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <div className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse border border-slate-200/50 dark:border-slate-700/50"></div>
             <div className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse border border-slate-200/50 dark:border-slate-700/50"></div>
             <div className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse border border-slate-200/50 dark:border-slate-700/50 hidden lg:block"></div>
          </div>
          
          <div className="h-96 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse border border-slate-200/50 dark:border-slate-700/50"></div>
        </div>
      )}

      {status === 'results' && resultData && (() => {
        const netFlow = resultData.totalDeposits - resultData.totalWithdrawals
        const largestExpense = resultData.transactions.reduce((max, tx) => tx.withdrawal > max.withdrawal ? tx : max, { withdrawal: 0 } as Transaction)
        
        let sumUpi = 0, sumCash = 0, sumOther = 0
        resultData.transactions.forEach(tx => {
            if (tx.withdrawal > 0) {
                const pUpper = tx.particulars.toUpperCase()
                if (pUpper.includes('UPI') || pUpper.includes('PHONEPE') || pUpper.includes('PAYTM') || pUpper.includes('GPAY')) sumUpi += tx.withdrawal
                else if (pUpper.includes('CASH') || pUpper.includes('ATM') || pUpper.includes('WITHDRAWAL')) sumCash += tx.withdrawal
                else sumOther += tx.withdrawal
            }
        })

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Analysis Summary</h2>
              <button 
                onClick={() => { setStatus('idle'); setSelectedFile(null); setResultData(null) }}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Upload New File
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-green-300 dark:hover:border-green-900 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ArrowDownCircle className="w-24 h-24 text-green-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium mb-2">
                            <ArrowDownCircle className="w-5 h-5" />
                            Total Came In (Deposits)
                        </div>
                        <div className="text-4xl font-extrabold text-slate-800 dark:text-white">{formatCurrency(resultData.totalDeposits)}</div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-red-300 dark:hover:border-red-900 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ArrowUpCircle className="w-24 h-24 text-red-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium mb-2">
                            <ArrowUpCircle className="w-5 h-5" />
                            Total Spent (Withdrawals)
                        </div>
                        <div className="text-4xl font-extrabold text-slate-800 dark:text-white">{formatCurrency(resultData.totalWithdrawals)}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-5 rounded-2xl shadow-sm border flex items-center justify-between col-span-1 bg-white/50 dark:bg-slate-900/50 ${netFlow >= 0 ? 'border-green-200 dark:border-green-900/50' : 'border-orange-200 dark:border-orange-900/50'}`}>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Net Cash Flow</p>
                        <p className={`text-xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                          {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
                        </p>
                    </div>
                    <div className={`p-3 rounded-full ${netFlow >= 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400'}`}>
                        {netFlow >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    </div>
                </div>

                <div className="glass-card p-5 flex items-center justify-between col-span-1">
                    <div className="max-w-[70%]">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Largest Expense</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-slate-200 truncate">{formatCurrency(largestExpense.withdrawal)}</p>
                        <p className="text-xs text-slate-400 truncate mt-1" title={largestExpense.particulars}>{largestExpense.particulars || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 shrink-0">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>

                <div className="glass-card p-5 flex flex-col justify-center col-span-1">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-2 flex items-center gap-1">
                        <PieChart className="w-4 h-4" /> Spending Breakdown
                    </p>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs items-center">
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><span className="w-2 h-2 rounded-full bg-purple-500"></span> UPI</span>
                            <span className="font-medium">{formatCurrency(sumUpi)}</span>
                        </div>
                        <div className="flex justify-between text-xs items-center">
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><span className="w-2 h-2 rounded-full bg-orange-400"></span> ATM/Cash</span>
                            <span className="font-medium">{formatCurrency(sumCash)}</span>
                        </div>
                        <div className="flex justify-between text-xs items-center">
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Other</span>
                            <span className="font-medium">{formatCurrency(sumOther)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spending Charts */}
            <SpendingChart transactions={resultData.transactions} />

            <div className="glass-card rounded-2xl overflow-hidden mt-6">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200">Extracted Transactions</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Click column headers to sort ascending or descending</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                            onClick={exportCSV}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-200 dark:border-indigo-800/50 text-sm"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="text" 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search particulars or date..." 
                              className="pl-9 pr-4 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-slate-900 dark:text-slate-100" 
                            />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left select-none">
                        <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                {['date', 'particulars', 'deposit', 'withdrawal'].map((col) => (
                                  <th 
                                    key={col}
                                    onClick={() => handleSort(col as typeof sortCol)}
                                    className={`px-6 py-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${col === 'deposit' || col === 'withdrawal' ? 'text-right' : ''} ${sortCol === col ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
                                  >
                                      <div className={`flex items-center gap-1 ${col === 'deposit' || col === 'withdrawal' ? 'justify-end' : ''}`}>
                                        {col === 'deposit' ? 'Deposits (In)' : col === 'withdrawal' ? 'Withdrawals (Out)' : col.charAt(0).toUpperCase() + col.slice(1)} 
                                        <ArrowDown className={`w-3 h-3 transition-transform ${sortCol === col ? (sortAsc ? 'rotate-180 opacity-100' : 'opacity-100') : 'opacity-30'}`} />
                                      </div>
                                  </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {getFilteredAndSortedTransactions().length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="p-0">
                                    <div className="flex flex-col items-center justify-center py-16 px-4">
                                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                                        <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                      </div>
                                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">No transactions found</h3>
                                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
                                        {searchTerm ? "We couldn't find any transactions matching your search." : "We couldn't extract any valid transactions from this document. Please make sure the image or PDF is clear and legible."}
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                            ) : (
                              (() => {
                                const filtered = getFilteredAndSortedTransactions()
                                const totalPages = Math.ceil(filtered.length / rowsPerPage)
                                const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                                return (
                                  <>
                                    {paginated.map((tx, idx) => (
                                      <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{tx.date || '-'}</td>
                                        <td className="px-6 py-4 max-w-xs truncate text-slate-800 dark:text-slate-200" title={tx.particulars}>{tx.particulars || '-'}</td>
                                        <td className="px-6 py-4 text-right font-medium text-green-600 dark:text-green-400">{tx.deposit > 0 ? formatCurrency(tx.deposit) : '-'}</td>
                                        <td className="px-6 py-4 text-right font-medium text-red-600 dark:text-red-400">{tx.withdrawal > 0 ? formatCurrency(tx.withdrawal) : '-'}</td>
                                      </tr>
                                    ))}
                                  </>
                                )
                              })()
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {getFilteredAndSortedTransactions().length > rowsPerPage && (
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Showing {((currentPage - 1) * rowsPerPage) + 1}–{Math.min(currentPage * rowsPerPage, getFilteredAndSortedTransactions().length)} of {getFilteredAndSortedTransactions().length}
                    </p>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-300"
                      >
                        Prev
                      </button>
                      {Array.from({ length: Math.min(5, Math.ceil(getFilteredAndSortedTransactions().length / rowsPerPage)) }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 text-sm rounded-lg transition-colors ${currentPage === page ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                        >
                          {page}
                        </button>
                      ))}
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(getFilteredAndSortedTransactions().length / rowsPerPage), p + 1))} 
                        disabled={currentPage >= Math.ceil(getFilteredAndSortedTransactions().length / rowsPerPage)}
                        className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-300"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )
      })()}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-card rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
                <div className="flex items-center gap-3 mb-4 text-indigo-600 dark:text-indigo-400">
                    <Lock className="w-6 h-6" />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Protected PDF</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">This bank statement is password protected. Please enter the password to unlock it locally.</p>
                
                <input 
                  type="password" 
                  value={pdfPassword}
                  onChange={(e) => setPdfPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setShowPasswordModal(false)
                      passwordPromiseRef.current?.resolve(pdfPassword)
                    } else if (e.key === 'Escape') {
                      setShowPasswordModal(false)
                      passwordPromiseRef.current?.resolve(null)
                    }
                  }}
                  autoFocus
                  className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2 transition-shadow text-slate-900 dark:text-slate-100" 
                  placeholder="Enter document password"
                />
                
                {passwordError && (
                  <div className="text-red-500 dark:text-red-400 text-xs font-medium mb-4 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Incorrect password. Try again.
                  </div>
                )}
                
                <div className="flex justify-end gap-3 mt-6">
                    <button 
                      onClick={() => {
                        setShowPasswordModal(false)
                        passwordPromiseRef.current?.resolve(null)
                      }} 
                      className="px-5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        setShowPasswordModal(false)
                        passwordPromiseRef.current?.resolve(pdfPassword)
                      }} 
                      className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                    >
                      Unlock
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
