export type Transaction = { date: string, particulars: string, deposit: number, withdrawal: number }
export type ResultData = { totalDeposits: number, totalWithdrawals: number, transactions: Transaction[] }

export function processExtractedText(text: string): ResultData {
  const lines = text.split('\n')
  let blocks: any[] = []
  let currentBlock: any = null
  
  const dateRegex = /^(\d{2}[-/\.]\d{2}[-/\.]\d{2,4}|\d{2}\s+[A-Za-z]{3}\s+\d{2,4})/
  const numberRegex = /\b(?:\d{1,2}(?:,\d{2})*,\d{3}|\d{1,3}(?:,\d{3})*|\d+)\.\d{1,2}\b/g

  for (let line of lines) {
    line = line.trim()
    if (!line) continue
    
    const upper = line.toUpperCase()
    if (upper.includes('OPENING BALANCE') || upper.includes('CLOSING BALANCE') || 
        upper.includes('BROUGHT FORWARD') || upper.includes('CARRIED FORWARD') || 
        upper.includes('STATEMENT SUMMARY') || upper.includes('PAGE ') || upper.includes('TOTAL')) {
        continue
    }
    
    const dateMatch = line.match(dateRegex)
    if (dateMatch) {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = {
            date: dateMatch[1],
            text: line.substring(dateMatch[0].length).trim()
        }
    } else if (currentBlock) {
        currentBlock.text += ' ' + line
    }
  }
  if (currentBlock) blocks.push(currentBlock)

  let transactions: Transaction[] = []
  let totalDeposits = 0
  let totalWithdrawals = 0
  let lastBalance: number | null = null

  for (let b of blocks) {
    let numbersStr: string[] = []
    let match
    while ((match = numberRegex.exec(b.text)) !== null) {
        numbersStr.push(match[0])
    }

    let particulars = b.text
    numbersStr.forEach(num => { particulars = particulars.replace(num, '') })
    particulars = particulars.replace(/\s{2,}/g, ' ').replace(/Rs\.?/gi, '').trim()

    if (numbersStr.length > 0) {
        let parsedNums = numbersStr.map(n => parseFloat(n.replace(/,/g, '')))
        
        let amount = 0
        let balance: number | null = null

        if (parsedNums.length >= 2) {
            amount = parsedNums[parsedNums.length - 2]
            balance = parsedNums[parsedNums.length - 1]
        } else if (parsedNums.length === 1) {
            amount = parsedNums[0]
        }

        if (amount === 0) continue 

        let isDeposit = false
        let isWithdrawal = false
        const pUpper = particulars.toUpperCase()
        let deltaMatched = false

        if (balance !== null && lastBalance !== null) {
            let delta = balance - lastBalance
            delta = Math.round(delta * 100) / 100 
            if (Math.abs(Math.abs(delta) - amount) <= 2.0) {
                if (delta > 0) { isDeposit = true }
                else if (delta < 0) { isWithdrawal = true }
                deltaMatched = true
            }
        }

        if (!deltaMatched) {
            if (parsedNums.length === 1 && lastBalance !== null) {
                lastBalance = amount
                continue
            }
            if (pUpper.includes('/CR') || /\bCR\b/.test(pUpper) || pUpper.includes('CREDIT') || pUpper.includes(' ACH/') || pUpper.includes('NEFT/CR') || /\bDEP\b/.test(pUpper)) {
                isDeposit = true
            } 
            else if (pUpper.includes('/DR') || /\bDR\b/.test(pUpper) || pUpper.includes('DEBIT') || pUpper.includes('WITHDRAW') || pUpper.includes('UPI/DR') || pUpper.includes('CASH HANDLING') || pUpper.includes('CH SB')) {
                isWithdrawal = true
            } 
            else if (pUpper.includes('UPI/') && !pUpper.includes('/CR') && !/\bCR\b/.test(pUpper)) {
                isWithdrawal = true
            }
            else if (balance !== null && lastBalance !== null) {
                let delta = balance - lastBalance
                if (delta > 0) isDeposit = true
                else if (delta < 0) isWithdrawal = true
            }
            else {
                if (amount > 10000000) continue 
                isWithdrawal = true 
            }
        }

        if (balance !== null) lastBalance = balance

        if (isDeposit) {
            totalDeposits += amount
            transactions.push({ date: b.date, particulars, deposit: amount, withdrawal: 0 })
        } else if (isWithdrawal) {
            totalWithdrawals += amount
            transactions.push({ date: b.date, particulars, deposit: 0, withdrawal: amount })
        }
    }
  }

  return { totalDeposits, totalWithdrawals, transactions }
}
