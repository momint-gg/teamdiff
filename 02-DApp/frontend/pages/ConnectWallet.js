import { useAccount, useConnect } from 'wagmi'
import styles from "../styles/Home.module.css";
import 'bootstrap/dist/css/bootstrap.css'

export default function ConnectWallet() {
  const [{ data: connectData, error: connectError }, connect] = useConnect()
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  })

  if (accountData) {
    return (
      <main className={styles.main}>
        <img src={accountData.ens?.avatar} alt="ENS Avatar" />
        <div>
          {accountData.ens?.name
            ? `${accountData.ens?.name} (${accountData.address})`
            : accountData.address}
        </div>
        <div>Connected to {accountData.connector.name}</div>
        <button className="btn btn-outline-success me-2" style={{ margin: 20 }} onClick={disconnect}>Disconnect</button>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      {connectData.connectors.map((x) => (
        <button className="btn btn-outline-success me-2" style={{ margin: 20 }} disabled={!x.ready} key={x.id} onClick={() => connect(x)}>
          {x.name}
          {!x.ready && ' (unsupported)'}
        </button>
      ))}

      {connectError && <div>{connectError?.message ?? 'Failed to connect'}</div>}
    </main>
  )
}
