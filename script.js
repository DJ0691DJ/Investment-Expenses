/* BGTF Financial Tracker backup / restore
 * This file is loaded only by finance.html, after the tracker has initialized its data arrays.
 * It stores data only in this browser's localStorage and downloads backups locally.
 */
(function () {
    'use strict';

    const MAX_BACKUP_BYTES = 2 * 1024 * 1024; // 2 MB
    const MAX_RECORDS = 500;
    const STORAGE_KEYS = {
        investments: 'finpulse_investments',
        incomes: 'finpulse_incomes',
        expenses: 'finpulse_expenses'
    };
    const INVESTMENT_CATEGORIES = [
        'Bank Accounts', 'Crypto', 'Other Assets', 'Real Estate',
        'Retirement/401k', 'Stocks/Equities'
    ];
    const EXPENSE_CATEGORIES = [
        'Cash Withdraw', 'Charitable Donations', 'Child', 'Credit Card',
        'Entertainment', 'Food', 'Going Out to Eat', 'Hobbies', 'Housing',
        'Insurance', 'Medical', 'Monthly Dues', 'Other', 'Pet', 'Projects',
        'Taxes', 'Transport', 'Utilities', 'Vacations'
    ];
    const INCOME_CATEGORIES = [
        'Disability', 'Other', 'Retirement/401k', 'Salary',
        'Side Hustle', 'Social Security'
    ];

    function boundedText(value, field, maxLength, required) {
        if (typeof value !== 'string') throw new Error(field + ' must be text.');
        const cleaned = value.trim();
        if (required && !cleaned) throw new Error(field + ' cannot be blank.');
        if (cleaned.length > maxLength) throw new Error(field + ' is too long.');
        return cleaned;
    }

    function money(value, field) {
        const number = Number(value);
        if (!Number.isFinite(number) || number < 0 || number > 1000000000000) {
            throw new Error(field + ' must be a valid non-negative amount.');
        }
        return number;
    }

    function validateArray(value, label, validator) {
        if (!Array.isArray(value)) throw new Error(label + ' must be a list.');
        if (value.length > MAX_RECORDS) throw new Error(label + ' contains too many records (maximum ' + MAX_RECORDS + ').');
        return value.map((record, index) => validator(record, label + ' record ' + (index + 1)));
    }

    function validateInvestment(record, label) {
        if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error(label + ' is invalid.');
        const category = boundedText(record.category, label + ' category', 40, true);
        if (!INVESTMENT_CATEGORIES.includes(category)) throw new Error(label + ' has an unknown investment category.');
        const date = record.date == null || record.date === '' ? '' : boundedText(record.date, label + ' date', 10, false);
        if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(label + ' has an invalid date.');
        return {
            name: boundedText(record.name, label + ' name', 120, true),
            category,
            startValue: money(record.startValue ?? record.value ?? 0, label + ' starting value'),
            value: money(record.value, label + ' current value'),
            date,
            notes: record.notes == null ? '' : boundedText(record.notes, label + ' notes', 1000, false)
        };
    }

    function validateExpense(record, label) {
        if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error(label + ' is invalid.');
        const category = boundedText(record.category, label + ' category', 40, true);
        if (!EXPENSE_CATEGORIES.includes(category)) throw new Error(label + ' has an unknown expense category.');
        return {
            title: boundedText(record.title, label + ' title', 120, true),
            category,
            amount: money(record.amount, label + ' amount'),
            notes: record.notes == null ? '' : boundedText(record.notes, label + ' notes', 1000, false)
        };
    }

    function validateIncome(record, label) {
        if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error(label + ' is invalid.');
        const category = boundedText(record.category, label + ' category', 40, true);
        if (!INCOME_CATEGORIES.includes(category)) throw new Error(label + ' has an unknown income category.');
        return {
            title: boundedText(record.title, label + ' title', 120, true),
            category,
            amount: money(record.amount, label + ' amount')
        };
    }

    function getCurrentData() {
        return {
            investments: validateArray(investments, 'Investments', validateInvestment),
            incomes: validateArray(incomes, 'Income', validateIncome),
            expenses: validateArray(expenses, 'Expenses', validateExpense),
            exportDate: new Date().toISOString(),
            formatVersion: 2
        };
    }

    window.exportFinancialData = function exportFinancialData() {
        try {
            const data = getCurrentData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'bgtf_financial_backup_' + new Date().toISOString().slice(0, 10) + '.json';
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            alert('The backup could not be created: ' + error.message);
        }
    };

    window.importFinancialData = function importFinancialData(event) {
        const file = event && event.target && event.target.files && event.target.files[0];
        if (!file) return;
        const input = event.target;
        if (file.size > MAX_BACKUP_BYTES) {
            alert('This backup is larger than 2 MB and was not imported.');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function () {
            try {
                const parsed = JSON.parse(String(reader.result || ''));
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('The backup must contain a JSON object.');

                // Only accept the three documented tracker collections. Never write arbitrary keys.
                // Accept both the original page's backup object and the old script's
                // exact finpulse_* storage-key export, but never arbitrary storage keys.
                const source = {
                    investments: parsed.investments ?? parsed.finpulse_investments,
                    incomes: parsed.incomes ?? parsed.finpulse_incomes,
                    expenses: parsed.expenses ?? parsed.finpulse_expenses
                };
                const validated = {
                    investments: validateArray(source.investments, 'Investments', validateInvestment),
                    incomes: validateArray(source.incomes, 'Income', validateIncome),
                    expenses: validateArray(source.expenses, 'Expenses', validateExpense)
                };
                if (!confirm('This will replace the investments, income, and expenses currently saved in this browser. Continue?')) return;

                const previous = {};
                try {
                    Object.values(STORAGE_KEYS).forEach(key => { previous[key] = localStorage.getItem(key); });
                    localStorage.setItem(STORAGE_KEYS.investments, JSON.stringify(validated.investments));
                    localStorage.setItem(STORAGE_KEYS.incomes, JSON.stringify(validated.incomes));
                    localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(validated.expenses));
                } catch (storageError) {
                    Object.entries(previous).forEach(([key, value]) => {
                        try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch (_) {}
                    });
                    throw new Error('The browser could not save the imported data. Existing data was restored where possible.');
                }
                alert('Backup imported successfully. The tracker will reload.');
                window.location.reload();
            } catch (error) {
                alert('Backup not imported: ' + error.message);
            } finally {
                input.value = '';
            }
        };
        reader.onerror = function () {
            alert('The backup file could not be read.');
            input.value = '';
        };
        reader.readAsText(file, 'UTF-8');
    };
})();
