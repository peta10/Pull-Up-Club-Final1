import React, { useState, useReducer, useEffect } from "react";
import { FormState } from "../../types/index.ts";
import { Button } from "../../components/ui/Button";
import { clubs, regions } from "../../data/mockData";
import { AlertTriangle, CreditCard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { createCheckoutSession } from "../../lib/stripe";
import { supabase } from "../../lib/supabase";

// Form reducer
const formReducer = (state: FormState, action: any): FormState => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "NEXT_STEP":
      return { ...state, step: state.step + 1 };
    case "PREV_STEP":
      return { ...state, step: state.step - 1 };
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.value };
    case "SET_PAYMENT_STATUS":
      return { ...state, paymentStatus: action.status };
    case "SET_ERROR":
      return { ...state, errorMessage: action.message };
    case "RESET_FORM":
      return initialFormState;
    case "INITIALIZE_USER_DATA":
      return { ...state, ...action.data };
    default:
      return state;
  }
};

// Initial form state
const initialFormState: FormState = {
  step: 1,
  fullName: "",
  email: "",
  phone: "",
  age: 0,
  gender: "Male",
  region: "",
  clubAffiliation: "",
  otherClubAffiliation: "",
  pullUpCount: 0,
  videoLink: "",
  videoConfirmed: false,
  videoAuthenticity: false,
  consentChecked: false,
  isSubmitting: false,
  paymentStatus: "idle",
  errorMessage: "",
  subscriptionType: "monthly",
};

const SubmissionForm: React.FC = () => {
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const { user } = useAuth();

  // Check if user is a subscriber from URL parameter
  const isSubscriber =
    new URLSearchParams(window.location.search).get("member") === "true";
  const isResubmission =
    new URLSearchParams(window.location.search).get("resubmit") === "true";

  // Initialize form with user data if they're a subscriber
  useEffect(() => {
    if (isSubscriber && user) {
      dispatch({
        type: "INITIALIZE_USER_DATA",
        data: {
          email: user.email,
        },
      });
    }
  }, [isSubscriber, user]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      dispatch({ type: "UPDATE_FIELD", field: name, value: checked });
    } else if (name === "videoLink") {
      let validatedUrl = value;
      if (value && !value.match(/^https?:\/\//)) {
        validatedUrl = `https://${value}`;
      }
      dispatch({ type: "UPDATE_FIELD", field: name, value: validatedUrl });
    } else if (name === "email") {
      dispatch({ type: "UPDATE_FIELD", field: name, value });
      setEmailError("");
    } else {
      dispatch({ type: "UPDATE_FIELD", field: name, value });
    }
  };

  const validateEmail = () => {
    if (!formState.email.includes("@")) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.step === 1 && !validateEmail()) {
      return;
    }
    dispatch({ type: "NEXT_STEP" });
  };

  const handlePrevStep = () => {
    dispatch({ type: "PREV_STEP" });
  };

  const submitVideoForReview = async () => {
    try {
      // If "Other" is selected, use the otherClubAffiliation value
      const finalClubAffiliation =
        formState.clubAffiliation === "Other"
          ? formState.otherClubAffiliation
          : formState.clubAffiliation;

      const { error } = await supabase.from("submissions").insert([
        {
          user_id: user?.id,
          pull_up_count: formState.pullUpCount,
          video_url: formState.videoLink,
          status: "pending",
          club_affiliation: finalClubAffiliation,
          region: formState.region,
          age: formState.age,
          gender: formState.gender,
        },
      ]);

      if (error) throw error;

      setFormSubmitted(true);
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        message: err instanceof Error ? err.message : "Failed to submit video",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) {
      return;
    }

    try {
      dispatch({ type: "SET_SUBMITTING", value: true });

      // If "Other" is selected, use the otherClubAffiliation value
      const finalClubAffiliation =
        formState.clubAffiliation === "Other"
          ? formState.otherClubAffiliation
          : formState.clubAffiliation;

      if (isSubscriber) {
        await submitVideoForReview();
      } else {
        dispatch({ type: "SET_PAYMENT_STATUS", status: "processing" });
        const checkoutUrl = await createCheckoutSession(
          formState.subscriptionType,
          formState.email,
          {
            userId: String(formState.email),
            fullName: formState.fullName,
            clubAffiliation: finalClubAffiliation,
          } as Record<string, string>
        );
        
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          throw new Error("Failed to create checkout session");
        }
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
      dispatch({ type: "SET_PAYMENT_STATUS", status: "failed" });
    } finally {
      dispatch({ type: "SET_SUBMITTING", value: false });
    }
  };

  const validateStep = () => {
    if (isSubscriber) {
      return (
        !formState.pullUpCount ||
        !formState.videoLink ||
        !formState.videoLink.match(/^https?:\/\//) ||
        !formState.videoConfirmed ||
        !formState.videoAuthenticity
      );
    }

    switch (formState.step) {
      case 1:
        return (
          !formState.fullName ||
          !formState.email ||
          !formState.age ||
          !formState.region ||
          !formState.email.includes("@") ||
          (formState.clubAffiliation === "Other" &&
            !formState.otherClubAffiliation)
        );
      case 2:
        return (
          !formState.pullUpCount ||
          !formState.videoLink ||
          !formState.videoLink.match(/^https?:\/\//) ||
          !formState.videoConfirmed ||
          !formState.videoAuthenticity
        );
      case 3:
        return !formState.consentChecked;
      default:
        return false;
    }
  };

  if (formSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-500 p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {isResubmission
              ? "Thank You for Your Resubmission!"
              : "Thank You for Your Submission!"}
          </h2>
          <p className="text-gray-300 mb-6">
            Your video is being reviewed by our team. You'll be notified once a
            decision has been made. Good luck!
          </p>
          <Button
            onClick={() => (window.location.href = "/profile")}
            variant="primary"
            size="lg"
          >
            Return to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {/* Progress bar - hide for subscribers */}
        {!isSubscriber && (
          <div className="bg-gray-900 p-4">
            <div className="flex justify-between mb-2">
              {["Personal Info", "Performance", "Payment"].map(
                (step, index) => (
                  <span
                    key={index}
                    className={`text-sm ${
                      formState.step > index + 1 || formState.step === index + 1
                        ? "text-white"
                        : "text-gray-500"
                    }`}
                  >
                    Step {index + 1}: {step}
                  </span>
                )
              )}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-[#9b9b6f] h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${(formState.step / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Form content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {isSubscriber ? (
              isResubmission ? (
                "Resubmit Your Video"
              ) : (
                "Submit Your Video"
              )
            ) : (
              <>
                {formState.step === 1 && "Personal Information"}
                {formState.step === 2 && "Performance Details"}
                {formState.step === 3 && "Review & Payment"}
              </>
            )}
          </h2>

          {formState.errorMessage && (
            <div className="bg-red-900 border border-red-700 text-white p-4 rounded-lg mb-6 flex items-center">
              <AlertTriangle size={20} className="mr-2" />
              <span>{formState.errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Only show personal info step for non-subscribers */}
            {!isSubscriber && formState.step === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-white mb-1">
                    Full Name <span className="text-[#9b9b6f]">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formState.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-white mb-1">
                    Email <span className="text-[#9b9b6f]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#9b9b6f] ${
                      emailError ? "border-2 border-red-500" : ""
                    }`}
                    required
                  />
                  {emailError && (
                    <p className="mt-1 text-sm text-red-500">{emailError}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-white mb-1">
                    Phone Number (for SMS notifications - optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formState.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="age" className="block text-white mb-1">
                      Age <span className="text-[#9b9b6f]">*</span>
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      min="16"
                      max="100"
                      value={formState.age || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-white mb-1">
                      Gender <span className="text-[#9b9b6f]">*</span>
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formState.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="region" className="block text-white mb-1">
                    Region <span className="text-[#9b9b6f]">*</span>
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={formState.region}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                    required
                  >
                    <option value="">Select your region</option>
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="clubAffiliation"
                    className="block text-white mb-1"
                  >
                    Club Affiliation
                  </label>
                  <select
                    id="clubAffiliation"
                    name="clubAffiliation"
                    value={formState.clubAffiliation}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                  >
                    <option value="">Select a club (optional)</option>
                    {clubs.map((club) => (
                      <option key={club} value={club}>
                        {club}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>

                  {formState.clubAffiliation === "Other" && (
                    <div className="mt-2">
                      <input
                        type="text"
                        id="otherClubAffiliation"
                        name="otherClubAffiliation"
                        value={formState.otherClubAffiliation}
                        onChange={handleChange}
                        placeholder="Enter your club name"
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Video submission step - shown to both subscribers and non-subscribers */}
            {(isSubscriber || formState.step === 2) && (
              <div className="space-y-4">
                {isResubmission && (
                  <div className="bg-[#9b9b6f] bg-opacity-20 border-l-4 border-[#9b9b6f] p-4 mb-6">
                    <p className="text-white">
                      Your previous submission was rejected. Please ensure your
                      new video follows all requirements before submitting.
                    </p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="pullUpCount"
                    className="block text-white mb-1"
                  >
                    Pull-Up Count <span className="text-[#9b9b6f]">*</span>
                  </label>
                  <input
                    type="number"
                    id="pullUpCount"
                    name="pullUpCount"
                    min="1"
                    max="100"
                    value={formState.pullUpCount || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="videoLink" className="block text-white mb-1">
                    Video Link <span className="text-[#9b9b6f]">*</span>
                  </label>
                  <input
                    type="url"
                    id="videoLink"
                    name="videoLink"
                    value={formState.videoLink}
                    onChange={handleChange}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-400">
                    Please upload your video to YouTube, Instagram, or TikTok
                    and paste the public link here.
                  </p>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium text-white mb-2">
                    Video Requirements
                  </h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                    <li>Clear, unobstructed view of the full movement</li>
                    <li>Chin must clear the bar for each rep</li>
                    <li>Full arm extension at the bottom of each rep</li>
                    <li>Continuous recording without cuts or edits</li>
                    <li>Video must be publicly accessible</li>
                  </ul>
                </div>

                <div className="flex items-start mt-4">
                  <input
                    type="checkbox"
                    id="videoConfirmed"
                    name="videoConfirmed"
                    checked={formState.videoConfirmed}
                    onChange={handleChange}
                    className="w-5 h-5 mt-1 mr-3 rounded border-gray-300 text-[#9b9b6f] focus:ring-[#9b9b6f] cursor-pointer"
                    required
                  />
                  <label
                    htmlFor="videoConfirmed"
                    className="text-gray-300 text-sm"
                  >
                    I confirm that the video link I have provided is correct,
                    publicly accessible, and viewable without requiring login
                    credentials, permissions, or special access settings. I
                    understand that if the link is broken, private, or otherwise
                    inaccessible to Pull-Up Club administrators or judges, my
                    submission may be disqualified. I acknowledge that Pull-Up
                    Club will not reimburse any fees or provide refunds for
                    submissions that cannot be reviewed due to inaccessible or
                    improperly shared video links.{" "}
                    <span className="text-[#9b9b6f]">*</span>
                  </label>
                </div>

                <div className="flex items-start mt-4">
                  <input
                    type="checkbox"
                    id="videoAuthenticity"
                    name="videoAuthenticity"
                    checked={formState.videoAuthenticity}
                    onChange={handleChange}
                    className="w-5 h-5 mt-1 mr-3 rounded border-gray-300 text-[#9b9b6f] focus:ring-[#9b9b6f] cursor-pointer"
                    required
                  />
                  <label
                    htmlFor="videoAuthenticity"
                    className="text-gray-300 text-sm"
                  >
                    By submitting this video, I confirm that it is 100%
                    authentic and represents a genuine, unaltered recording of
                    my performance. I certify that the video has not been
                    generated, enhanced, or manipulated using artificial
                    intelligence (AI) tools or software of any kind. I also
                    affirm that the footage has not been edited in a way that
                    creates loops, repetitions, or visual effects intended to
                    misrepresent the actual number of pull-ups performed. Any
                    form of tampering, misrepresentation, or video manipulation
                    will result in immediate disqualification and forfeiture of
                    any associated entry fees, rankings, or rewards.{" "}
                    <span className="text-[#9b9b6f]">*</span>
                  </label>
                </div>
              </div>
            )}

            {/* Payment step - only for non-subscribers */}
            {!isSubscriber && formState.step === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="font-medium text-white mb-4 text-lg">
                    Choose Your Subscription Plan
                  </h3>

                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        formState.subscriptionType === "monthly"
                          ? "border-[#9b9b6f] bg-gray-800"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "subscriptionType",
                          value: "monthly",
                        })
                      }
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="monthly"
                          name="subscriptionType"
                          value="monthly"
                          checked={formState.subscriptionType === "monthly"}
                          onChange={() =>
                            dispatch({
                              type: "UPDATE_FIELD",
                              field: "subscriptionType",
                              value: "monthly",
                            })
                          }
                          className="w-5 h-5 mr-3 text-[#9b9b6f] focus:ring-[#9b9b6f] cursor-pointer"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor="monthly"
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <span className="text-white font-medium">
                              Monthly Subscription
                            </span>
                            <span className="text-[#9b9b6f] font-bold">
                              $9.99/month
                            </span>
                          </label>
                          <p className="text-gray-400 text-sm mt-1">
                            Perfect for month-to-month flexibility
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        formState.subscriptionType === "annual"
                          ? "border-[#9b9b6f] bg-gray-800"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "subscriptionType",
                          value: "annual",
                        })
                      }
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="annual"
                          name="subscriptionType"
                          value="annual"
                          checked={formState.subscriptionType === "annual"}
                          onChange={() =>
                            dispatch({
                              type: "UPDATE_FIELD",
                              field: "subscriptionType",
                              value: "annual",
                            })
                          }
                          className="w-5 h-5 mr-3 text-[#9b9b6f] focus:ring-[#9b9b6f] cursor-pointer"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor="annual"
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <span className="text-white font-medium">
                              Annual Subscription
                            </span>
                            <span className="text-[#9b9b6f] font-bold">
                              $99.99/year
                            </span>
                          </label>
                          <p className="text-gray-400 text-sm mt-1">
                            Save over 16% with annual billing
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-center text-gray-400">
                    <CreditCard size={20} className="mr-2" />
                    <span className="text-sm">
                      Secure payment powered by Stripe
                    </span>
                  </div>
                </div>

                <div className="flex items-start mt-4">
                  <input
                    type="checkbox"
                    id="consentChecked"
                    name="consentChecked"
                    checked={formState.consentChecked}
                    onChange={handleChange}
                    className="w-5 h-5 mt-1 mr-3 rounded border-gray-300 text-[#9b9b6f] focus:ring-[#9b9b6f] cursor-pointer"
                    required
                  />
                  <label
                    htmlFor="consentChecked"
                    className="text-gray-300 text-sm"
                  >
                    I agree to the{" "}
                    <a href="#" className="text-[#9b9b6f] hover:underline">
                      Terms of Service
                    </a>{" "}
                    and acknowledge that my submission may be used for
                    promotional purposes.{" "}
                    <span className="text-[#9b9b6f]">*</span>
                  </label>
                </div>
              </div>
            )}

            {/* Form navigation */}
            <div className="mt-8 flex justify-between">
              {!isSubscriber && formState.step > 1 && (
                <Button
                  onClick={handlePrevStep}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  Back
                </Button>
              )}

              {!isSubscriber && formState.step < 3 ? (
                <Button onClick={handleNextStep} disabled={validateStep()}>
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={validateStep() || formState.isSubmitting}
                  isLoading={formState.isSubmitting}
                  className={isSubscriber ? "w-full" : ""}
                >
                  {isSubscriber
                    ? isResubmission
                      ? "Resubmit Video"
                      : "Submit Video"
                    : `Subscribe ${
                        formState.subscriptionType === "monthly"
                          ? "($9.99/month)"
                          : "($99.99/year)"
                      }`}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmissionForm;
