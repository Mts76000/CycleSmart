import { faqs } from "./faq-data";

export function FaqSection() {
  return (
    <section
      className="surface-card mx-auto mt-5 max-w-4xl p-4 sm:p-5 md:p-7"
      aria-labelledby="faq-title"
    >
      <h2 id="faq-title" className="text-xl font-bold text-stone-950 sm:text-2xl">
        Questions fréquentes sur les heures creuses
      </h2>
      <p className="mt-1 max-w-2xl text-sm leading-5 text-stone-600 sm:mt-2 sm:text-base sm:leading-6">
        Tout ce qu&apos;il faut savoir pour bien utiliser le calculateur et réduire sa facture
        d&apos;électricité.
      </p>

      <div className="mt-6 space-y-3">
        {faqs.map(({ question, answer }) => (
          <details className="group surface-sub rounded-2xl p-4 open:bg-white" key={question}>
            <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-stone-950">
              {question}
              <span
                className="ml-3 grid size-7 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700 transition group-open:rotate-180"
                aria-hidden="true"
              >
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-6 text-stone-600">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
