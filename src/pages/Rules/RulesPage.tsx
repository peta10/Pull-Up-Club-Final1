import React from "react";
import Layout from "../../components/Layout/Layout";
import CompetitionRules from "../Submission/CompetitionRules";

const RulesPage: React.FC = () => {
  return (
    <Layout>
      <div className="bg-black py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Competition Rules</h1>
            <p className="mt-2 text-gray-400">
              Please review our official competition rules and video submission
              requirements carefully. All participants must adhere to these
              guidelines to be eligible for the competition.
            </p>
          </div>

          <CompetitionRules />
        </div>
      </div>
    </Layout>
  );
};

export default RulesPage;
