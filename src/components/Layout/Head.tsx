import React from "react";
import { Helmet } from "react-helmet";

interface HeadProps {
  children?: React.ReactNode;
}

const Head: React.FC<HeadProps> = ({ children }) => (
  <Helmet>
    <title>Pull-Up Club | Battle Bunker</title>
    <meta name="description" content="Join the Pull-Up Club. Compete globally, earn badges, and climb the leaderboard for just $9.99/mo." />
    <meta property="og:image" content="/NewWebp-Pics/pullup_header.webp" />
    <meta property="og:title" content="Pull-Up Club | Battle Bunker" />
    <meta property="og:description" content="Compete globally, earn badges, and climb the leaderboard." />
    <link rel="canonical" href="https://yourdomain.com/" />
    {children}
  </Helmet>
);

export default Head; 