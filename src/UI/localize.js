export function getLocalized(item, field) {
    if (!item) return ''
    const lang = localStorage.getItem('i18nextLng')?.slice(0, 2) || 'ru'
    return (
        item[`${field}_${lang}`] ||
        item[`${field}_ru`]      ||
        item[`${field}_en`]      ||
        item[`${field}_uz`]      ||
        item[field]              ||
        ''
    )
}