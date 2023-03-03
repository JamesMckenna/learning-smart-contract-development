import '../styles/globals.css';
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";


//initializeOnMount={ true } - a way to hook into web2 api/backend server(??)
function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider initializeOnMount={ false }>
      <NotificationProvider>
        <Component {...pageProps} />
      </NotificationProvider>
    </MoralisProvider>
  )
}

export default MyApp
