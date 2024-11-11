export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 max-h-[75vh] -mt-5 ">
      <div className="inline-block  text-center justify-center ">
        {children}
      </div>
    </section>
  );
}
