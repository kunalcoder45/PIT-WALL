import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 sm:px-8 py-16">
      <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight text-white">
        Privacy Policy
      </h1>

      <div className="mt-8 space-y-6 text-sm leading-7 text-text-muted">

        <section>
          <h2 className="font-display text-xl uppercase text-white">
            About This Project
          </h2>
          <p className="mt-2">
            PITWALLHUB is an unofficial Formula racing fan project created to
            provide race information, telemetry visualization, schedules,
            standings, and other motorsport related features.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">
            Data Source
          </h2>
          <p className="mt-2">
            This project uses publicly available data provided by OpenF1 API.
            The data includes race sessions, drivers, lap information,
            telemetry data, weather information, and championship standings.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">
            Data Usage
          </h2>
          <p className="mt-2">
            We only use third-party API data to display motorsport statistics
            and create an interactive fan experience. We do not claim ownership
            of the data provided by external sources.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">
            Personal Information
          </h2>
          <p className="mt-2">
            This website does not collect personal information from users.
            No account creation, passwords, or private user data are stored.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">
            Cookies and Analytics
          </h2>
          <p className="mt-2">
            If analytics or third-party services are added in the future,
            they may collect anonymous usage information to improve the
            website experience.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">
            Disclaimer
          </h2>
          <p className="mt-2">
            PITWALLHUB is an independent fan project and is not affiliated with,
            endorsed by, or connected to Formula One, FIA, Formula One
            Management, or any official motorsport organization.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">
            Contact
          </h2>
          <p className="mt-2">
            For questions regarding this website or its data usage, please
            contact the project owner.
          </p>
        </section>

      </div>

      <Link
        href="/"
        className="inline-flex mt-10 text-red font-mono text-sm uppercase hover:underline"
      >
        ← Back to Home
      </Link>
    </main>
  );
}