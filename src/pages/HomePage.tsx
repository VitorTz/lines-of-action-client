import { useState, useEffect } from "react";
import type { PageType } from "../types/general";
import LoadingPage from "./LoadingPage";
import { linesApi } from "../api/linesApi";



interface HomePageProps {
  navigate: (page: PageType, data?: any) => void;
}

const HomePage = ({ navigate }: HomePageProps) => {
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(false)
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="home-page">
      <p>teste</p>
    </div>
  );
};


export default HomePage;