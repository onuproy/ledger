import { Link } from 'react-router-dom'

export function ForgotPassword() {
  return (
    <div className="min-h-screen bg-surface text-textprimary flex flex-col justify-center px-6 gap-4">
      <h1 className="text-2xl font-semibold mb-2">Reset password</h1>
      <input
        type="email"
        placeholder="Email"
        className="bg-card border border-border rounded-lg px-4 py-3 min-h-[48px] text-textprimary placeholder:text-textsecondary"
      />
      <button className="bg-accent hover:bg-accent-hover text-white rounded-lg px-6 py-3 min-h-[48px]">
        Send reset link
      </button>
      <div className="text-sm text-textsecondary text-center">
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  )
}
