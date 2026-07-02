function layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full max-w-[520px] mx-auto pt-25 px-5">
      <h1 className="text-center text-4xl font-medium">Book Link</h1>

      <p className="text-center pt-3">
        책으로 연결되는 사람들, 지금 만나보세요.
      </p>

      <div className="mt-15">{children}</div>
    </main>
  );
}

export default layout;
