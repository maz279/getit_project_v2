import React from 'react';

interface ARProductProps {
  title: string;
  description: string;
  onTryAR?: () => void;
}

const ARProduct: React.FC<ARProductProps> = ({ title, description, onTryAR }) => (
  <div className="bg-white border flex grow items-stretch gap-[5px] w-full pt-2 pb-[15px] px-2.5 rounded-[5px] border-[rgba(217,217,217,1)] border-solid max-md:mt-2.5 hover:shadow-lg transition-shadow">
    <div className="text-[10px]">
      <div className="flex items-stretch text-white font-semibold">
        <div className="text-black text-xs grow my-auto">{title}</div>
        <div className="bg-[rgba(0,106,78,1)] whitespace-nowrap w-[23px] h-[23px] px-1 rounded-[50%]">
          AR
        </div>
        <div className="bg-[rgba(0,106,78,1)] whitespace-nowrap w-[23px] h-[23px] px-[5px] rounded-[50%]">
          3D
        </div>
      </div>
      <div className="text-black font-normal mt-1 max-md:mr-1">
        {description}
      </div>
    </div>
    <div className="text-xs text-white font-semibold">
      <div className="rounded bg-[rgba(197,197,197,1)] flex w-[104px] shrink-0 h-[104px]" />
      <button 
        onClick={onTryAR}
        className="bg-[rgba(224,22,43,1)] mt-[9px] px-5 py-1 rounded-[5px] hover:bg-[rgba(224,22,43,0.8)] transition-colors"
      >
        AR Try-On
      </button>
    </div>
  </div>
);

export const ARShowcase: React.FC = () => {
  const arProducts = Array(6).fill({
    title: "Product Full Title",
    description: "Give shoppers the possibility to discover jewellery online with the industry's most true-to-life 3D and AR solutions. Our proprietary technology delivers the highest realism in materials and fit, vividly showcasing the nuanced light reflections of Product and coloured gems."
  });

  return (
    <section className="self-stretch flex items-stretch ml-[13px] mt-[19px]">
      <button className="bg-[rgba(217,217,217,1)] text-sm text-black font-normal whitespace-nowrap text-center w-[22px] h-[22px] my-auto px-1.5 rounded-[50%] max-md:mr-[-9px] hover:bg-[rgba(217,217,217,0.8)] transition-colors">
        &lt;
      </button>
      
      <div className="mr-[-34px] max-md:max-w-full">
        <div className="bg-[rgba(242,242,242,1)] flex w-full flex-col items-stretch pt-[3px] pb-[9px] rounded-[5px] max-md:max-w-full">
          <div className="z-10 w-full px-px max-md:max-w-full">
            <div className="bg-[rgba(32,32,107,1)] flex w-full items-stretch gap-5 text-xs font-semibold flex-wrap justify-between px-3.5 py-2.5 rounded-[5px] max-md:max-w-full max-md:-mr-0.5">
              <div className="flex items-stretch gap-[9px] text-white">
                <div className="flex items-stretch gap-0.5 text-base font-bold">
                  <div className="grow my-auto">Augmented Reality</div>
                  <div className="bg-[rgba(201,201,201,1)] flex w-0.5 shrink-0 h-6" />
                </div>
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <div className="bg-white self-stretch flex w-[11px] shrink-0 h-[18px] my-auto rounded-[3px]" />
                  <div className="self-stretch my-auto">AR</div>
                  <div className="bg-[rgba(201,201,201,1)] self-stretch flex w-0.5 shrink-0 h-6" />
                </div>
                <div className="flex items-stretch gap-1 whitespace-nowrap my-auto">
                  <div className="bg-white flex w-[11px] shrink-0 h-[18px] rounded-[3px]" />
                  <div>3D</div>
                </div>
              </div>
              <div className="flex items-stretch gap-1">
                <div className="text-white grow">SEE MORE</div>
                <button className="z-10 bg-white text-black whitespace-nowrap px-1 py-0.5 rounded-[5px] hover:bg-gray-100 transition-colors">
                  &gt;
                </button>
              </div>
            </div>
            
            <div className="w-[863px] max-w-full mt-[5px]">
              <div className="gap-5 flex max-md:flex-col max-md:items-stretch">
                {arProducts.slice(0, 3).map((product, index) => (
                  <div key={index} className="w-[33%] max-md:w-full max-md:ml-0">
                    <ARProduct
                      title={product.title}
                      description={product.description}
                      onTryAR={() => console.log(`AR Try-On for product ${index + 1}`)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex mt-[-159px] w-[455px] max-w-full flex-col pb-[152px] max-md:mr-2.5 max-md:pb-[100px]">
            <div className="flex flex-col relative z-10 aspect-[1.223] w-[400px] max-w-full items-center pt-[283px] pb-9 px-[46px] rounded-[5px] max-md:pt-[100px] max-md:px-5">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/c5a9e6a3346949f6969d40ed9f6f4f58/bc26826dc5986432a129440674d74670d975e08e?placeholderIfAbsent=true"
                alt="AR Showcase Background"
                className="absolute h-full w-full object-cover inset-0"
              />
              <div className="relative flex w-9 items-stretch gap-1.5">
                <div className="bg-black flex w-2 shrink-0 h-2 rounded-[50%]" />
                <div className="bg-[rgba(160,160,160,1)] flex w-2 shrink-0 h-2 rounded-[50%]" />
                <div className="bg-[rgba(160,160,160,1)] flex w-2 shrink-0 h-2 rounded-[50%]" />
              </div>
            </div>
            <button className="bg-[rgba(217,217,217,1)] mt-[-174px] mb-[-30px] w-[22px] text-sm text-black font-normal whitespace-nowrap text-center h-[22px] px-1.5 rounded-[50%] max-md:mb-2.5 hover:bg-[rgba(217,217,217,0.8)] transition-colors">
              &gt;
            </button>
          </div>
          
          <div className="z-10 mt-[-154px] w-[572px] max-w-full">
            <div className="gap-5 flex max-md:flex-col max-md:items-stretch">
              {arProducts.slice(3, 5).map((product, index) => (
                <div key={index + 3} className="w-6/12 max-md:w-full max-md:ml-0">
                  <ARProduct
                    title={product.title}
                    description={product.description}
                    onTryAR={() => console.log(`AR Try-On for product ${index + 4}`)}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white border self-center z-10 flex mt-[-159px] w-[281px] max-w-full items-stretch gap-[5px] ml-16 pt-2 pb-[15px] px-2.5 rounded-[5px] border-[rgba(217,217,217,1)] border-solid">
            <div className="text-[10px]">
              <div className="flex items-stretch text-white font-semibold">
                <div className="text-black text-xs grow my-auto">Product Full Title</div>
                <div className="bg-[rgba(0,106,78,1)] whitespace-nowrap w-[23px] h-[23px] px-1 rounded-[50%]">
                  AR
                </div>
                <div className="bg-[rgba(0,106,78,1)] whitespace-nowrap w-[23px] h-[23px] px-[5px] rounded-[50%]">
                  3D
                </div>
              </div>
              <div className="text-black font-normal mt-1 max-md:mr-1">
                Give shoppers the possibility to discover jewellery online with the industry's most true-to-life 3D and AR solutions. Our proprietary technology delivers the highest realism in materials and fit, vividly showcasing the nuanced light reflections of Product and coloured gems.
              </div>
            </div>
            <div className="text-xs text-white font-semibold">
              <div className="rounded bg-[rgba(197,197,197,1)] flex w-[104px] shrink-0 h-[104px]" />
              <button className="bg-[rgba(224,22,43,1)] mt-[9px] px-5 py-1 rounded-[5px] hover:bg-[rgba(224,22,43,0.8)] transition-colors">
                AR Try-On
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
