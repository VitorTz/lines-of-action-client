import { useState, useEffect } from "react";
import type { PageType } from "../types/general";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignUpPage";
import Header from "./Header";
import Footer from "./Footer";
import AccountPage from "../pages/AccountPage";
import HomePage from "../pages/HomePage";

const Router = () => {

  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [pageData, setPageData] = useState<any>(null);

  const pageFromHash = (hash: string): {page: PageType, data?: any} => {
    if (!hash) return { page: "home" as PageType, data: null };
    const clean: string | PageType = hash.replace(/^#/, "");

    if (clean.startsWith("manga-")) {
      const id = parseInt(clean.split("-")[1], 10);
      return { page: "manga" as PageType, data: { id } };
    }
    if (clean.startsWith("reader-")) {
      const nums = clean
        .split("-")
        .slice(1)
        .map((i) => parseInt(i));
      return {
        page: "reader" as PageType,
        data: { mangaId: nums[0], chapterId: nums[1], chapterIndex: nums[2] },
      };
    }
    if (clean === "account") return { page: "account", data: null };
    if (clean === "login") return { page: "login", data: null };
    if (clean === "signup") return { page: "signup", data: null };
    if (clean === "match-history") return { page: "match-history", data: null };
    return { page: "home", data: null };
  };

  useEffect(() => {
    const initial = pageFromHash(window.location.hash);
    setCurrentPage(initial.page);
    setPageData(initial.data);

    window.history.replaceState(
      { page: initial.page, data: initial.data },
      "",
      window.location.href
    );

    const handlePop = (e: PopStateEvent) => {
      if (e.state && e.state.page) {
        setCurrentPage(e.state.page);
        setPageData(e.state.data ?? null);
      } else {
        const parsed = pageFromHash(window.location.hash);
        setCurrentPage(parsed.page);
        setPageData(parsed.data);
      }
      window.scrollTo(0, 0);
    };

    const handleHash = () => {
      const parsed = pageFromHash(window.location.hash);
      setCurrentPage(parsed.page);
      setPageData(parsed.data);
      window.history.replaceState(
        { page: parsed.page, data: parsed.data },
        "",
        window.location.href
      );
      window.scrollTo(0, 0);
    };

    window.addEventListener("popstate", handlePop);
    window.addEventListener("hashchange", handleHash);
    return () => {
      window.removeEventListener("popstate", handlePop);
      window.removeEventListener("hashchange", handleHash);
    };
  }, []);

  const navigate = (page: PageType, data: any = null) => {
    setCurrentPage(page);
    setPageData(data);
    window.scrollTo(0, 0);
    
    let hash = `#${page}`;

    // if (page === "manga" && data?.id) {
    //     hash = `#manga-${data.id}`;
    // }
    // if (page === "reader") {
    //     hash = `#reader-${data.mangaId}-${data.chapterId}-${data.chapterIndex}`;
    // }
    
    window.history.pushState(
      { page, data },
      "",
      `${window.location.pathname}${hash}`
    );
  };

  const renderPage = () => {
    switch (currentPage) {
      case "account":
        return <AccountPage navigate={navigate} />;
      case "home":
        return <HomePage navigate={navigate} />;
      case "login":
        return <LoginPage navigate={navigate} />;
      case "signup":
        return <SignupPage navigate={navigate} />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentPage]);

  return (
    <div className="app">
      <Header navigate={navigate} />
      <main className="main-content">{renderPage()}</main>
      <Footer />
    </div>
  );
};

export default Router;
