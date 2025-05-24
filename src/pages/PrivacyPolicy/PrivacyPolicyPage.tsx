import React from "react";
import Layout from "../../components/Layout/Layout";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <Layout>
      <div className="bg-black py-16">
        <div className="container mx-auto px-4">
          <div className="prose prose-invert max-w-none">
            <div className="bg-gray-900 rounded-lg p-8 space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white">
                  Privacy Policy
                </h1>
                <p className="text-gray-300 mt-2">
                  Effective Date: May 4, 2025
                </p>
              </div>

              <p className="text-gray-300">
                At Pull-Up Club (operated by Battle Bunker), we respect your
                privacy and are committed to protecting your personal data. This
                Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you visit our website
                pullupclub.com, regardless of where you are located.
              </p>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  1. Information We Collect
                </h2>
                <p className="text-gray-300">
                  We may collect the following types of personal information:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>
                    Contact Information (name, email address, phone number)
                  </li>
                  <li>Account Information (username, password)</li>
                  <li>
                    Purchase Information (payment details, billing/shipping
                    address)
                  </li>
                  <li>
                    User-Submitted Content (pull-up videos, social media tags)
                  </li>
                  <li>
                    Device Information (IP address, browser type, operating
                    system)
                  </li>
                  <li>Usage Data (pages visited, time spent, clicks)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  2. How We Use Your Information
                </h2>
                <p className="text-gray-300">We use your data to:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Process and fulfill orders</li>
                  <li>
                    Verify pull-up video submissions and track tier rankings
                  </li>
                  <li>
                    Communicate updates, promotions, and program announcements
                  </li>
                  <li>Improve our site functionality and user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  3. Legal Basis for Processing (GDPR)
                </h2>
                <p className="text-gray-300">
                  For users in the EU/UK, we rely on the following legal bases:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>
                    Performance of a contract (e.g. when you purchase or submit)
                  </li>
                  <li>
                    Legitimate interests (e.g. analytics, program improvement)
                  </li>
                  <li>Consent (e.g. for marketing emails)</li>
                  <li>Compliance with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  4. Sharing Your Information
                </h2>
                <p className="text-gray-300">
                  We do not sell your personal data. We may share it with:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>
                    Service providers (e.g., payment processors, fulfillment
                    centers, email/SMS providers)
                  </li>
                  <li>Analytics tools (e.g., Google Analytics)</li>
                  <li>Legal authorities (only if required by law)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  5. Data Retention
                </h2>
                <p className="text-gray-300">
                  We retain your information only as long as necessary for the
                  purpose it was collected, unless a longer period is required
                  by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  6. Your Rights
                </h2>
                <p className="text-gray-300">
                  Depending on your location, you have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Access, correct, or delete your data</li>
                  <li>Object to or restrict processing</li>
                  <li>Withdraw consent at any time (for marketing)</li>
                  <li>Lodge a complaint with your local data authority</li>
                </ul>
                <p className="text-gray-300 mt-2">
                  To exercise your rights, email us at support@pullupclub.com
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  7. Cookies & Tracking
                </h2>
                <p className="text-gray-300">
                  We use cookies and similar technologies to analyze traffic,
                  personalize content, and improve functionality. You can manage
                  your cookie preferences in your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  8. Children's Privacy
                </h2>
                <p className="text-gray-300">
                  Our services are not intended for users under 13. We do not
                  knowingly collect personal information from children.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  9. International Transfers
                </h2>
                <p className="text-gray-300">
                  Your data may be stored and processed in the United States or
                  other countries where our servers or service providers are
                  located. We ensure appropriate safeguards are in place (e.g.,
                  Standard Contractual Clauses for EU data transfers).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  10. Policy Updates
                </h2>
                <p className="text-gray-300">
                  We may update this Privacy Policy periodically. Changes will
                  be posted on this page with an updated effective date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  11. Contact Us
                </h2>
                <p className="text-gray-300">
                  If you have questions about this policy or your data, contact:
                </p>
                <p className="text-gray-300 mt-2">
                  Pull-Up Club
                  <br />
                  support@pullupclub.com
                  <br />
                  871 Harold Place, Chula Vista, CA 91914
                  <br />
                  United States
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  12. Cookies Policy
                </h2>
                <p className="text-gray-300 mb-4">
                  Our website uses cookies and similar technologies to enhance
                  your browsing experience. This section explains how we use
                  these technologies and your choices regarding them.
                </p>

                <h3 className="text-xl font-bold text-white mb-2">
                  What Are Cookies?
                </h3>
                <p className="text-gray-300 mb-4">
                  Cookies are small text files placed on your device when you
                  visit our website. They help us recognize your device and
                  remember certain information about your preferences or
                  actions.
                </p>

                <h3 className="text-xl font-bold text-white mb-2">
                  Types of Cookies We Use
                </h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>
                    Essential Cookies: Required for basic website functionality
                  </li>
                  <li>Authentication Cookies: Remember your login status</li>
                  <li>
                    Preference Cookies: Store your settings and preferences
                  </li>
                  <li>
                    Analytics Cookies: Help us understand how visitors use our
                    site
                  </li>
                  <li>
                    Marketing Cookies: Track effectiveness of our marketing
                    efforts
                  </li>
                </ul>

                <h3 className="text-xl font-bold text-white mb-2">
                  Managing Cookies
                </h3>
                <p className="text-gray-300 mb-4">
                  You can control cookies through your browser settings. Most
                  browsers allow you to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                  <li>Block all cookies</li>
                  <li>Delete existing cookies</li>
                  <li>Be notified when receiving new cookies</li>
                  <li>Enable or disable third-party cookies</li>
                </ul>

                <p className="text-gray-300 mb-4">
                  Please note that blocking some types of cookies may impact
                  your experience on our website and limit access to certain
                  features.
                </p>

                <h3 className="text-xl font-bold text-white mb-2">
                  Third-Party Cookies
                </h3>
                <p className="text-gray-300 mb-4">
                  We use services from third parties that may place cookies on
                  your device. These include:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Google Analytics (website analytics)</li>
                  <li>Stripe (payment processing)</li>
                  <li>Social media platforms (sharing functionality)</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicyPage;
