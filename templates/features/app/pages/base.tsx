export default function Home() {
  return (
    <main className="flex flex-col flex-1 items-center justify-center text-foreground bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-4">
          <h1 className="text-7xl font-bold">BTT Stack</h1>
          <p className="text-lg max-w-2xl">A modern fullstack toolkit built with Next.js, authentication, database ORM, and UI primitives for rapid and scalable development.</p>
        </div>
      </div>
    </main>
  );
}