import { describe, it, expect } from 'vitest'
import { processExtractedText } from './parser'

describe('processExtractedText', () => {
  it('should ignore header lines like OPENING BALANCE', () => {
    const text = `OPENING BALANCE
12-05-2023 Grocery Store 50.00 1,000.00`
    const result = processExtractedText(text)
    // The opening balance line should be ignored, and the transaction processed.
    expect(result.transactions).toHaveLength(1)
    expect(result.transactions[0].particulars).toContain('Grocery Store')
  })

  it('should correctly parse a simple withdrawal with balance', () => {
    const text = `15-06-2023 ATM WITHDRAWAL 500.00 9,500.00`
    const result = processExtractedText(text)
    
    expect(result.transactions).toHaveLength(1)
    expect(result.totalWithdrawals).toBe(500)
    expect(result.transactions[0].withdrawal).toBe(500)
    expect(result.transactions[0].deposit).toBe(0)
  })

  it('should correctly parse a simple deposit with balance', () => {
    const text = `20-06-2023 NEFT/CR/Salary 5,000.00 14,500.00`
    const result = processExtractedText(text)
    
    expect(result.transactions).toHaveLength(1)
    expect(result.totalDeposits).toBe(5000)
    expect(result.transactions[0].deposit).toBe(5000)
    expect(result.transactions[0].withdrawal).toBe(0)
  })

  it('should correctly infer deposit based on balance delta', () => {
    const text = `01-07-2023 Unknown Txn 100.00 1,000.00
02-07-2023 Unknown Txn 200.00 1,200.00`
    const result = processExtractedText(text)
    
    expect(result.transactions).toHaveLength(2)
    // First transaction doesn't have a previous balance to compare, and no keywords.
    // By default, unknown amounts > 0 are usually withdrawals if no balance context.
    // Let's check the second one specifically. It went from 1000 -> 1200.
    expect(result.transactions[1].deposit).toBe(200)
  })

  it('should format particulars by stripping amounts', () => {
    const text = `10-10-2023 Amazon Purchase Rs. 499.00 2,500.00`
    const result = processExtractedText(text)
    
    expect(result.transactions[0].particulars).toBe('Amazon Purchase')
  })
})
