import React from "react";
import Layout from "../../components/Layout/Layout";
import { Button } from "../../components/ui/Button";
import { Link } from "../../components/ui/Link";

const NotFoundPage: React.FC = () => {
  return (
    <Layout>
      <div className="bg-gray-900 py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold text-white mb-6">404</h1>
          <h2 className="text-3xl font-bold text-red-500 mb-8">
            Page Not Found
          </h2>
          <p className="text-white text-xl mb-12 max-w-2xl mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button variant="primary" size="lg">
            <Link href="/" className="text-white">
              Return to Homepage
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
