interface DecriptionPanelProps {}

const DecriptionPanel = ({}: DecriptionPanelProps) => {
  return (
    <>
      <div className="border-b flex items-center py-3 text-black px-4">
        Description
      </div>
      <div className="p-3 text-[#292929] leading-6">
        This Non-Disclosure Agreement (NDA) is a binding contract between ABC
        Corp and XYZ Inc to protect confidential information shared during their
        collaboration. Both parties agree to keep all proprietary data, trade
        secrets, and sensitive information disclosed during their partnership
        strictly confidential and not to share it with any third parties.
      </div>
      <div className="flex flex-col gap-4 p-3">
        <div className="">Also cited in:</div>
        <div className="">
          <span className="underline text-[#0550b3]">
            Motion for Extension of Time
          </span>{" "}
          as 'Exhibit_1'
        </div>
        <div className="">
          <span className="underline text-[#0550b3]">
            Motion for Summary Judgement
          </span>{" "}
          as 'Exhibit_2'
        </div>
        <div className="">
          <span className="underline text-[#0550b3]">Motion to Dismiss</span> as
          'Exhibit_4'
        </div>
      </div>
    </>
  );
};

export default DecriptionPanel;
