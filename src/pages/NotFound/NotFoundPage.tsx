import React from "react";
import { Link as RouterLink } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { Button } from "../../components/ui/Button";

const NotFoundPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-9xl font-bold text-[#9b9b6f] mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          The page you are looking for does not exist. It might have been moved or deleted.
        </p>
        <RouterLink to="/">
          <Button size="lg">
            Go Back Home
          </Button>
        </RouterLink>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
