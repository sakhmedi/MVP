type Props = {
    onClose: () => void
}

const SignupModal = ({ onClose }: Props) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative">

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-black"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-semibold mb-6">
                    Join Blog.
                </h2>

                <div className="space-y-3">
                    <button className="w-full border rounded-full py-2 hover:bg-gray-100">
                        Sign up with Google
                    </button>

                    <button className="w-full border rounded-full py-2 hover:bg-gray-100">
                        Sign up with Facebook
                    </button>

                    <button className="w-full border rounded-full py-2 hover:bg-gray-100">
                        Sign up with email
                    </button>
                </div>

                <p className="mt-4 text-sm text-gray-600">
                    Already have an account?{" "}
                    <span className="text-black cursor-pointer underline">
                        Sign in
                    </span>
                </p>

                <p className="mt-6 text-xs text-gray-500">
                    By clicking &quot;Sign up&quot;, you accept Blog&apos;s Terms of Service
                    and Privacy Policy.
                </p>
            </div>
        </div>
    )
}

export default SignupModal
