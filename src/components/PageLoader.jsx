export default function PageLoader() {
  return (
    <div style={styles.container}>
      <div style={styles.loader}></div>
      <p style={styles.text}>Loading...</p>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    color: "#ffffff"
  },
  loader: {
    width: "40px",
    height: "40px",
    border: "4px solid #38bdf8",
    borderTop: "4px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  text: {
    marginTop: "12px",
    fontSize: "14px"
  }
};
