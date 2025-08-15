
import React from 'react';

export const ContestSections: React.FC = () => {
  return (
    <section className="w-full mt-[19px]">
      <div className="gap-5 flex max-md:flex-col max-md:items-stretch justify-center">
        <div className="w-[33%] max-md:w-full max-md:ml-0">
          <div className="flex flex-col relative min-h-[118px] grow text-sm text-black font-semibold text-center pt-[75px] pb-[9px] px-[70px] rounded-[5px] max-md:max-w-full max-md:px-5">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/c5a9e6a3346949f6969d40ed9f6f4f58/d55564b7fa75aab5f012d2de6a1052c15c43d27e?placeholderIfAbsent=true"
              alt="Regional Promotions"
              className="absolute h-full w-full object-cover inset-0"
            />
            <div className="relative">
              Regional Promotions
              <br />
              (e.g., Eid Sales)
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-[rgba(255,215,0,1)] flex flex-col items-stretch justify-center mt-[363px] px-[15px] py-[9px] rounded-[10px] max-md:mt-10 w-fit ml-auto">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/c5a9e6a3346949f6969d40ed9f6f4f58/57af553ae4806135aa860ca88efb1cb510498fd6?placeholderIfAbsent=true"
          alt="Floating Action Button"
          className="aspect-[1] object-contain w-[43px]"
        />
      </div>
    </section>
  );
};
