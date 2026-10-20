interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div
      style={{
        padding: '24px 4px',
        color: 'var(--muted)',
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      Раздел «{title}» — следующий экран.
    </div>
  )
}
