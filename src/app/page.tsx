import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Link from "next/link";
import { ArrowRight, PlayCircleIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
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
        <h1 className="max-w-5xl text-5xl font-extrabold md:text-6xl lg:text-7xl leading-tight">
          Your Analyst Co-Pilot
          <br/>
          <span className="text-gray-600"> Analyze</span>, 
          <span className="text-blue-600"> Understand</span>, 
          <span className="text-green-600"> Benchmark</span>
          <br/>
          and make 
          <span className="text-orange-600 italic"> Informed Decisions</span>
        </h1>
        <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
          Catalyst enables you to upload annual reports from your chosen companies and immediately begin querying the data.
        </p>
        <Link href="/dashboard" target="_blank" className={buttonVariants({ size: "lg", className: "mt-5" })}>
          Get started <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
        <Button className="bg-black mt-3" asChild>
          <Link href="https://www.youtube.com/watch?v=Px1rdv2ye8E" >
          {/* <a target="_blank"> */}
      <PlayCircleIcon className="mr-2 h-4 w-4 " />Watch the teaser
      {/* </a> */}
      </Link>
    </Button>
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
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 shadow-lg lg:-m-4 lg:rounded-2xl lg:p-4">
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
        <div className="mx-auto mt-20 max-w-5xl px-6 lg:px-8"> {/* Adjusted margin top here */}
              <div className="mb-12 border-2 border-gray-300 rounded-lg shadow-xl">
        <div className="mx-auto max-w-2xl text-center p-8">
          <h2 className="font-bold text-4xl text-gray-900 sm:text-5xl">
            Analyze Financial Reports
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Quickly compare two financial reports to uncover key differences. Our tool automatically analyzes the documents, providing essential insights into your financial performance. Prepare better for the future based on clear, actionable data.
          </p>
        </div>
      </div>



          <div className="mb-12 border-2 border-gray-300 rounded-lg shadow-xl">
            <div className="mt-5 mx-auto max-w-2xl text-center">
              <h2 className="font-bold text-4xl text-gray-900 sm:text-5xl">
              View Essential Information at a Glance
              </h2>
              <p className="mt-5 mb-4 text-lg text-gray-600">
              Prefer visual data? Access critical figures directly from pre-calculated tables. Easily identify key financial metrics without the need for extensive chat interaction. Simplify your decision-making with ready-to-view insights.
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
                  <span className="text-xl font-semibold">Upload your annual reports</span>
                  <span className="mt-2 text-zinc-700">
                    We&apos;ll process your files and make them ready for you to interact with.
                  </span>
                </div>
              </li>

              <li className="md:flex-1">
                <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-blue-600">Step 3</span>
                  <span className="text-xl font-semibold">Start asking questions</span>
                  <span className="mt-2 text-zinc-700">
                    It&apos;s that simple. Try it today - it really takes less than a minute.
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

    {/* FAQ Section */}
<div className="mx-auto mt-12 max-w-4xl px-7 lg:px-8">
<h2 className="font-bold text-gray-900 sm:text-5xl">FAQ</h2>

  <div className="pt-4">
    {/* FAQ Item 1 */}
    <div className="mb-6">
      <h4 className="text-lg font-medium text-gray-900">How do I upload my financial reports?</h4>
      <p className="mt-2 text-gray-600">You can upload your PDF financial reports directly through our secure upload feature.</p>
    </div>

    {/* FAQ Item 2 */}
    <div className="mb-6">
      <h4 className="text-lg font-medium text-gray-900">What key differences will I see?</h4>
      <p className="mt-2 text-gray-600">Our tool highlights significant changes in key financial metrics such as revenue, expenses, and profitability.</p>
    </div>

    {/* FAQ Item 3 */}
    <div className="mb-6">
      <h4 className="text-lg font-medium text-gray-900">Can I export the analysis results?</h4>
      <p className="mt-2 text-gray-600">Yes, you can export the analysis results in PDF or CSV format for further review or sharing.</p>
    </div>
  </div>
</div>

<footer className="mt-10 bg-gray-800 py-12">
  <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col items-center justify-center"> {/* Centered content */}
      <div className="grid grid-cols-2 gap-8 max-w-full">
        {/* Column 1 - Catalyst */}
        <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
          <h3><a href="#" className="text-lg font-bold text-white">Catalyst</a></h3>
          <p className="text-gray-400">123 Street, City, Country</p>
          <p className="text-gray-400">contact@catalyst.com</p>
          <p className="text-gray-400">+123 456 7890</p>
        </div>

        {/* Column 2 - Quick Links */}
        <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
          <h3 className="text-lg font-bold text-white">Quick Links</h3>
          <ul className="text-center md:text-left">
            <li><a href="localhost:3000" className="text-gray-400 hover:text-white transition duration-300">Home</a></li>
            <li><a href="localhost:3000/dashboard" className="text-gray-400 hover:text-white transition duration-300">Dashboard</a></li>
            <li><a href="localhost:3000/insights/company-analysis" className="text-gray-400 hover:text-white transition duration-300">Documentation</a></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; 2024 Catalyst. All rights reserved.</p>
      </div>
    </div>
  </div>
</footer>

    </>
  );
}
