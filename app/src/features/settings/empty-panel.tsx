type Props = {
  title: string;
  description: string;
};

export function EmptyPanel({ title, description }: Props) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
        Nothing here yet.
      </div>
    </section>
  );
}
