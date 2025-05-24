import React from 'react';
import Header from './Header';
import Footer from './Footer';
import AnalyticsWrapper from './AnalyticsWrapper';

interface LayoutProps {
  children: React.ReactNode;
  pageName?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, pageName }) => {
  return (
    <AnalyticsWrapper pageName={pageName}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </AnalyticsWrapper>
  );
};

export default Layout;