import type React from "react"

import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import { Modal } from "../modal/modal"
import { Button } from "../ui/button/button"
import { Input } from "../ui/input/input"
import "./user.auth.scss"

type ModalAuthProps = {
  isModal: boolean
  setClose: () => void
}

enum AuthStep {
  REGISTER = "register",
  VERIFY = "verify",
  LOGIN = "login",
}

const AuthUser = ({ isModal, setClose }: ModalAuthProps) => {
  const { login, register, verifyCode, requestCode } = useAuth()
  const [isLoader, setLoader] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<AuthStep>(AuthStep.REGISTER)
  const [form, setForm] = useState({
    name: "",
    email: "",
    code: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegister = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required")
      return
    }

    setLoader(true)
    setError(null)

    try {
      await register(form.name, form.email)
      setStep(AuthStep.VERIFY)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoader(false)
    }
  }

  const handleVerify = async () => {
    if (!form.code.trim()) {
      setError("Verification code is required")
      return
    }

    setLoader(true)
    setError(null)

    try {
      await verifyCode(form.email, form.code)
      setClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setLoader(false)
    }
  }

  const handleLogin = async () => {
    if (!form.email.trim()) {
      setError("Email is required")
      return
    }

    setLoader(true)
    setError(null)

    try {
      if (!form.code.trim()) {
        await requestCode(form.email)
        setStep(AuthStep.VERIFY)
      } else {
        await login(form.email, form.code)
        setClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoader(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case AuthStep.REGISTER:
        return (
          <>
            <div className="auth-register__infor-itens">
              <label htmlFor="name">Nome</label>
              <Input type="text" name="name" placeholder="Nome" value={form.name} onChange={handleInputChange} />
            </div>
            <div className="auth-register__infor-itens">
              <label htmlFor="email">Email</label>
              <Input type="email" name="email" placeholder="Email" value={form.email} onChange={handleInputChange} />
            </div>
            <Button theme="primary" onClick={handleRegister} disabled={isLoader}>
              {isLoader ? "Processing..." : "Register"}
            </Button>
            <div className="auth-register__switch">
              <span>Already have an account?</span>
              <button onClick={() => setStep(AuthStep.LOGIN)}>Login</button>
            </div>
          </>
        )

      case AuthStep.VERIFY:
        return (
          <>
            <div className="auth-register__infor-itens">
              <label htmlFor="code">Verification Code</label>
              <Input
                type="text"
                name="code"
                placeholder="Enter 6-digit code"
                value={form.code}
                onChange={handleInputChange}
              />
            </div>
            <Button theme="primary" onClick={handleVerify} disabled={isLoader}>
              {isLoader ? "Verifying..." : "Verify Code"}
            </Button>
            <div className="auth-register__resend">
              <button onClick={() => requestCode(form.email)} disabled={isLoader}>
                Resend Code
              </button>
            </div>
          </>
        )

      case AuthStep.LOGIN:
        return (
          <>
            <div className="auth-register__infor-itens">
              <label htmlFor="email">Email</label>
              <Input type="email" name="email" placeholder="Email" value={form.email} onChange={handleInputChange} />
            </div>
            {form.code && (
              <div className="auth-register__infor-itens">
                <label htmlFor="code">Verification Code</label>
                <Input
                  type="text"
                  name="code"
                  placeholder="Enter 6-digit code"
                  value={form.code}
                  onChange={handleInputChange}
                />
              </div>
            )}
            <Button theme="primary" onClick={handleLogin} disabled={isLoader}>
              {isLoader ? "Processing..." : form.code ? "Login" : "Send Verification Code"}
            </Button>
            <div className="auth-register__switch">
              <span>Don&apos;t have an account?</span>
              <button onClick={() => setStep(AuthStep.REGISTER)}>Register</button>
            </div>
          </>
        )
    }
  }

  return (
    <section className="auth-register__container">
      <Modal
        title={step === AuthStep.REGISTER ? "Register" : step === AuthStep.LOGIN ? "Login" : "Verify Code"}
        onClose={setClose}
        visible={isModal}
      >
        {error && <div className="auth-register__error">{error}</div>}

        <div className="auth-register__infor-form">{renderStep()}</div>

        <div className="news-upload__modal-actions">
          <Button onClick={setClose} className="news-upload__cancel-button" disabled={isLoader}>
            Cancel
          </Button>
        </div>
      </Modal>
    </section>
  )
}

export default AuthUser

