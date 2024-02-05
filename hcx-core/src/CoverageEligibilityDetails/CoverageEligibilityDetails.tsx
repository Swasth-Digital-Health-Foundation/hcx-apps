import React from "react"

const CoverageEligibilityDetails = (props: any) => {
    const { claimRequestDetails } = props
    return (
        <div>
            {claimRequestDetails.map((ele: any, index: any) => {
                return (
                    <div className="mb-2" key={index}>
                        <h2 className="text-bold text-base font-bold text-black dark:text-white">
                            {ele.key}
                        </h2>
                        <span className="text-base font-medium">{ele.value}</span>
                    </div>
                );
            })}
        </div>
    )
}

export default CoverageEligibilityDetails