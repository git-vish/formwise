import Footer from "./layout/footer";
import Header from "./layout/header";
import Logo from "./layout/logo";

export default function HomePage() {
  return (
    // TODO: check and update flex div and main
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <Logo />
      </main>
      <Footer />
    </div>
  );
}
