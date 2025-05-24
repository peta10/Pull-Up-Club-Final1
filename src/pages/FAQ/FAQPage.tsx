import React from "react";
import Layout from "../../components/Layout/Layout";
import FAQ from "../Submission/FAQ";

const FAQPage: React.FC = () => {
  return (
    <Layout>
      <div className="bg-black py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              Frequently Asked Questions
            </h1>
            <p className="mt-2 text-gray-400">
              Find answers to common questions about the Battle Bunker Pull-Up
              Challenge.
            </p>
          </div>

          <FAQ />
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;
