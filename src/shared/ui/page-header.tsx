import React from "react";
import InfoTooltip from "./info-tool-tip";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  tooltip?: string;
}

const PageHeader = ({
  title,
  description,
  children,
  icon,
  tooltip,
}: PageHeaderProps) => {
  return (
    <div className="md:flex justify-between items-start mb-4">
      <div>
        <div className="flex gap-3">
          {icon && <div className="flex items-center">{icon}</div>}
          <h1 className="text-2xl font-bold text-textPrimary capitalize">
            {title}
          </h1>
          {tooltip && <InfoTooltip content={tooltip} />}
        </div>

        {description && (
          <p className="text-md text-textSecondary max-w-3xl mt-1">
            {description}
          </p>
        )}
      </div>
      <div className="flex space-x-6 mt-4 md:mt-0">{children}</div>
    </div>
  );
};

export default PageHeader;
