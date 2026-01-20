import { useState } from "react"
import SignupModal from "./SignupModal"
import LoginModal from "./LoginModal"

const Hero = () => {
    const [showSignupModal, setShowSignupModal] = useState(false)
    const [showLoginModal, setShowLoginModal] = useState(false)

    return (
        <>
            <section className="px-6 py-24">
                <div className="mx-auto max-w-7xl">
                    <h1 className="text-[120px] font-serif leading-[0.8] mb-4">
                        Human
                        <br />
                        stories & ideas
                    </h1>

                    <p className="mt-4 text-[22px] text-gray-700 max-w-xl">
                        A place to read, write, and deepen your understanding
                    </p>

                    <button
                        onClick={() => setShowSignupModal(true)}
                        className="mt-8 text-[20px] rounded-full bg-black px-6 py-3 text-white text-sm hover:bg-gray-800"
                    >
                        Start reading
                    </button>
                </div>
            </section>

            {showSignupModal && (
                <SignupModal
                    onClose={() => setShowSignupModal(false)}
                    onSwitchToLogin={() => {
                        setShowSignupModal(false)
                        setShowLoginModal(true)
                    }}
                />
            )}

            {showLoginModal && (
                <LoginModal
                    onClose={() => setShowLoginModal(false)}
                    onSwitchToSignup={() => {
                        setShowLoginModal(false)
                        setShowSignupModal(true)
                    }}
                />
            )}
        </>
    )
}

export default Hero
