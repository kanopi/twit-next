import { PreviewAlert } from "components/preview-alert"
import Header from "components/head"

export function Layout({ children }) {
  return (
    <>
      <PreviewAlert />
        <Header />
        <main>{children}</main>
    </>
  )
}
