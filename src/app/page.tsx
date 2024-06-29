import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
        <div className="mx-auto mb-4 max-w-fit flex items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
          <p className="text-sm font-semibold text-gray-700 cursor-pointer">
            Catalyst is now available to the public 🚀
          </p>
        </div>
        <h1 className="max-w-5xl text-5xl font-bold md:text-6xl lg:text-7xl">
          Annual Report <span className="text-gray-600"><i>Dynamics:</i></span><br/>
          <span className="text-blue-600">Year-over-Year</span> and<br/><span className="text-blue-600">Sector-by-Sector</span> <span className="text-orange-600"><i>Analysis</i></span>
        </h1>
        <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
          Catalyst enables you to upload annual reports from your chosen companies and immediately begin querying the data.
        </p>
        <Link href="/dashboard" target="_blank" className={buttonVariants({ size: "lg", className: "mt-5" })}>
          Get started <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </MaxWidthWrapper>

      {/* Value proposition section */}
      <section className="relative">
        {/* Background gradient blob */}
        <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 overflow-hidden transform-gpu blur-3xl sm:-top-80">
          <div
            style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
            className="absolute left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff8091] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          ></div>
        </div>

        {/* Preview image */}
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <Image
                src="/productImage.jpeg"
                alt="chat preview"
                width={1364}
                height={866}
                quality={100}
                className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mb-32 mt-32 max-w-5xl sm:mt-56 px-6 lg:px-8">
          <div className="mb-12">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-bold text-4xl text-gray-900 sm:text-5xl">
                Start chatting in minutes
              </h2>
              <p className="mt-4 text-lg text-gray-600">
              Chatting with your PDF files has never been easier. Use the chat feature to gain valuable insight, get the answers you need and make the best decisions.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-bold text-4xl text-gray-900 sm:text-5xl">
                Get valuable insights on the tables
              </h2>
              <p className="mt-4 text-lg text-gray-600">
              Not much time to chat? Get the most important information in the tables that illustrate the most important information. To make your life even easier, everything is calculated in advance!
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="mb-12">
            <h2 className="font-bold text-4xl text-gray-900 sm:text-5xl">
              Steps to get you on board
            </h2>
            <ol className="my-8 space-y-4 pt-8 md:flex md:space-x-12 md:space-y-0">
              <li className="md:flex-1">
                <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-blue-600">Step 1</span>
                  <span className="text-xl font-semibold">Sign up for an account</span>
                  <span className="mt-2 text-zinc-700">
                    Either start out with a free plan or choose our{" "}
                    <Link href="/pricing" className="text-blue-700 underline underline-offset-2">
                      pro plan
                    </Link>
                    .
                  </span>
                </div>
              </li>

              <li className="md:flex-1">
                <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-blue-600">Step 2</span>
                  <span className="text-xl font-semibold">Upload your PDF file</span>
                  <span className="mt-2 text-zinc-700">
                    We'll process your file and make it ready for you to chat with.
                  </span>
                </div>
              </li>

              <li className="md:flex-1">
                <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-blue-600">Step 3</span>
                  <span className="text-xl font-semibold">Start asking questions</span>
                  <span className="mt-2 text-zinc-700">
                    It's that simple. Try out Quill today - it really takes less than a minute.
                  </span>
                </div>
              </li>
            </ol>
          </div>

          {/* Image */}
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mt-16 flow-root sm:mt-24">
              <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <Image
                  src="/file-upload-preview.jpg"
                  alt="uploading preview"
                  width={1419}
                  height={732}
                  quality={100}
                  className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
