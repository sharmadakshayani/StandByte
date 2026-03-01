import { Link } from "react-router-dom";

function Dashboard({ totalFocusTime = 0, totalDistractions = 0 }) {
  const productivityScore =
    totalFocusTime === 0
      ? 0
      : Math.max(
          0,
          Math.round(
            (totalFocusTime /
              (totalFocusTime + totalDistractions * 5)) *
              100
          )
        );

  const formatTime = (time) => {
    const t = Number(time) || 0;
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    return `${mins}m ${secs}s`;
  };

  const isEmpty = totalFocusTime === 0 && totalDistractions === 0;

  return (
    <div className="py-4">
      <div className="text-center mb-5 pb-2">
        <h1 className="display-5 fw-bold mb-2 hero-gradient">StandByte Analytics</h1>
        <p className="lead text-muted mb-0">Track your focus time and productivity at a glance.</p>
        <p className="text-muted small mt-1">Every session counts — stay consistent.</p>
      </div>

      {isEmpty ? (
        <div className="text-center py-5">
          <div className="card border-0 shadow-sm rounded-3 p-5 mx-auto" style={{ maxWidth: "400px" }}>
            <p className="text-muted mb-3">No sessions yet. Start your first focus session to see your stats here.</p>
            <Link to="/session" className="btn btn-primary rounded-pill px-4 btn-smooth">
              Start your first session
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="text-center text-muted small mb-3">Cumulative from all sessions</p>
          <div className="row g-4 justify-content-center">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-3 h-100 p-4 card-hover stat-card-primary">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-3 bg-primary bg-opacity-10 p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16" className="text-primary">
                      <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                    </svg>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="text-uppercase text-muted fw-semibold mb-1 small">Total Focus Time</h6>
                    <p className="fs-3 fw-bold mb-0 text-primary">{formatTime(totalFocusTime)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-3 h-100 p-4 card-hover stat-card-danger">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-3 bg-danger bg-opacity-10 p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16" className="text-danger">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                    </svg>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="text-uppercase text-muted fw-semibold mb-1 small">Total Distractions</h6>
                    <p className="fs-3 fw-bold mb-0 text-danger">{totalDistractions}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-3 h-100 p-4 card-hover stat-card-success">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-3 bg-success bg-opacity-10 p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16" className="text-success">
                      <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 1 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 1-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 1-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 1 1.828-1.828l.645-1.937zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.734 1.734 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.734 1.734 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.734 1.734 0 0 0 3.407 2.31l.387-1.162z" />
                    </svg>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="text-uppercase text-muted fw-semibold mb-1 small">Productivity Score</h6>
                    <p className="fs-3 fw-bold mb-0 text-success">{productivityScore}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
