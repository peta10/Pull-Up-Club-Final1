import React from "react";
import Layout from "../../components/Layout/Layout";

const CookiesPolicyPage: React.FC = () => {
  return (
    <Layout>
      <div className="bg-black py-16">
        <div className="container mx-auto px-4">
          <div className="prose prose-invert max-w-none">
            <div className="bg-gray-900 rounded-lg p-8 space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white">
                  Cookies Policy
                </h1>
                <p className="text-gray-300 mt-2">Last Updated: May 4, 2025</p>
              </div>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  What Are Cookies?
                </h2>
                <p className="text-gray-300">
                  Cookies are small text files placed on your device when you
                  visit our website. They help us recognize your device and
                  remember certain information about your preferences or
                  actions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Types of Cookies We Use
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Essential Cookies
                    </h3>
                    <p className="text-gray-300">
                      Required for basic website functionality. These cookies
                      are necessary for the website to work properly and cannot
                      be disabled.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Authentication Cookies
                    </h3>
                    <p className="text-gray-300">
                      Remember your login status and keep you signed in during
                      your session.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Preference Cookies
                    </h3>
                    <p className="text-gray-300">
                      Store your settings and preferences for future visits.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Analytics Cookies
                    </h3>
                    <p className="text-gray-300">
                      Help us understand how visitors use our site, which pages
                      are most popular, and identify any issues.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Marketing Cookies
                    </h3>
                    <p className="text-gray-300">
                      Track the effectiveness of our marketing efforts and
                      provide you with more relevant content.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Managing Cookies
                </h2>
                <p className="text-gray-300 mb-4">
                  You can control cookies through your browser settings. Most
                  browsers allow you to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Block all cookies</li>
                  <li>Delete existing cookies</li>
                  <li>Be notified when receiving new cookies</li>
                  <li>Enable or disable third-party cookies</li>
                </ul>
                <p className="text-gray-300 mt-4">
                  Please note that blocking some types of cookies may impact
                  your experience on our website and limit access to certain
                  features.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Third-Party Cookies
                </h2>
                <p className="text-gray-300 mb-4">
                  We use services from third parties that may place cookies on
                  your device. These include:
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Google Analytics
                    </h3>
                    <p className="text-gray-300">
                      Used to analyze website traffic and user behavior. These
                      cookies collect information about how you use our website.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Stripe
                    </h3>
                    <p className="text-gray-300">
                      Our payment processor uses cookies to enable secure
                      transactions and prevent fraud.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Social Media
                    </h3>
                    <p className="text-gray-300">
                      If you use social sharing buttons, the respective social
                      media platforms may set cookies to track this activity.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Updates to This Policy
                </h2>
                <p className="text-gray-300">
                  We may update this Cookies Policy from time to time. Changes
                  will be posted on this page with an updated effective date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Contact Us
                </h2>
                <p className="text-gray-300">
                  If you have questions about our use of cookies, please contact
                  us at:
                </p>
                <div className="mt-2 text-gray-300">
                  <p>Pull-Up Club</p>
                  <p>support@pullupclub.com</p>
                  <p>871 Harold Place, Chula Vista, CA 91914</p>
                  <p>United States</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CookiesPolicyPage;
