// The expense calls behind /api/finance:
//   GET  ?op=expenses        every expense (newest first), categories and payment methods
//   GET  ?op=suggest&vendor= the category to suggest for a vendor
//   GET  ?op=receipt&id=     one receipt photo
//   POST ?op=expense-add     { expense, receipt? }
//   POST ?op=expense-edit    { id, expense, receipt?, removeReceipt? }  (owner only)
//   POST ?op=expense-delete  { id }                                     (owner only)
import { can } from './roles.js'
import { CATEGORIES, Invalid, PAID_WITH, checkReceipt, cleanExpense, suggestCategory, vendorKey } from './expenses.js'
import {
  deleteReceipt,
  deleteRecord,
  getLearned,
  getReceipt,
  getRecord,
  isRecordId,
  listRecords,
  newRecordId,
  saveLearned,
  saveReceipt,
  saveRecord,
} from './records.js'

// Remembers the category Lino settled on for this vendor.
async function learn(expense) {
  const learned = await getLearned()
  const key = vendorKey(expense.vendor)
  if (key && learned[key] !== expense.category) {
    learned[key] = expense.category
    await saveLearned(learned)
  }
}

const denied = [403, { error: 'role', message: 'Your login can’t do that.' }]
const stripeFees = [400, { error: 'invalid', message: 'Stripe fees are kept up to date from Stripe, so they can’t be changed here.' }]

export async function expenseOps(op, req, user) {
  const get = req.method === 'GET'
  const post = req.method === 'POST'

  if (op === 'expenses' && get) {
    if (!can(user.role, 'view')) return denied
    const expenses = (await listRecords('expense')).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    return [200, { expenses, categories: CATEGORIES, paidWith: PAID_WITH, canEdit: can(user.role, 'edit'), canDelete: can(user.role, 'delete') }]
  }

  if (op === 'suggest' && get) {
    if (!can(user.role, 'view')) return denied
    return [200, { suggestion: suggestCategory(req.query?.vendor, await getLearned()) }]
  }

  if (op === 'receipt' && get) {
    if (!can(user.role, 'view')) return denied
    if (!isRecordId(req.query?.id)) return [404, { error: 'missing' }]
    const dataUrl = await getReceipt(req.query.id)
    return dataUrl ? [200, { dataUrl }] : [404, { error: 'missing' }]
  }

  if (op === 'expense-add' && post) {
    if (!can(user.role, 'add')) return denied
    const fields = cleanExpense(req.body?.expense)
    const receipt = req.body?.receipt ? checkReceipt(req.body.receipt) : null
    const now = new Date().toISOString()
    const expense = { id: newRecordId(), ...fields, receipt: Boolean(receipt), createdAt: now, updatedAt: now }
    if (receipt) await saveReceipt(expense.id, receipt)
    await saveRecord('expense', expense)
    await learn(expense)
    return [201, { expense }]
  }

  if (op === 'expense-edit' && post) {
    if (!can(user.role, 'edit')) return denied
    const id = req.body?.id
    const existing = isRecordId(id) ? await getRecord('expense', id) : null
    if (!existing) return [404, { error: 'missing', message: 'That expense was already removed.' }]
    if (existing.source === 'stripe') return stripeFees
    const fields = cleanExpense(req.body?.expense)
    const receipt = req.body?.receipt ? checkReceipt(req.body.receipt) : null
    let hasReceipt = existing.receipt
    if (receipt) {
      await saveReceipt(id, receipt)
      hasReceipt = true
    } else if (req.body?.removeReceipt) {
      await deleteReceipt(id)
      hasReceipt = false
    }
    const expense = { ...existing, ...fields, receipt: hasReceipt, updatedAt: new Date().toISOString() }
    await saveRecord('expense', expense)
    await learn(expense)
    return [200, { expense }]
  }

  if (op === 'expense-delete' && post) {
    if (!can(user.role, 'delete')) return denied
    const id = req.body?.id
    if (!isRecordId(id)) return [404, { error: 'missing' }]
    if ((await getRecord('expense', id))?.source === 'stripe') return stripeFees
    await deleteReceipt(id)
    await deleteRecord('expense', id)
    return [200, { deleted: id }]
  }

  return null
}

export { Invalid }
