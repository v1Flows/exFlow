import { SVGProps } from "react";

// eslint-disable-next-line no-undef
export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type InputParamType =
  | "text"
  | "number"
  | "boolean"
  | "select"
  | "textarea";

export interface InputParamOption {
  key: string;
  value: string;
}

export interface InputParam {
  id: string;
  name: string;
  label: string;
  description: string;
  type: InputParamType;
  required: boolean;
  default: string;
  options?: InputParamOption[];
  order: number;
}

export type InputValues = Record<string, string | number | boolean>;

export interface SelfServicePage {
  id: string;
  name: string;
  description: string;
  slug: string;
  project_id: string;
  created_by: string;
  icon: string;
  color: string;
  enabled: boolean;
  page_flows: PageFlow[];
  created_at: string;
  updated_at: string;
}

export interface PageFlow {
  flow_id: string;
  order: number;
  custom_label: string;
  custom_description: string;
  execution_visibility: "simplified" | "detailed" | "full";
  input_overrides: InputOverride[];
  // enriched fields from GET
  flow_name?: string;
  flow_description?: string;
  input_params?: InputParam[];
}

export interface InputOverride {
  input_param_id: string;
  custom_label: string;
  custom_description: string;
  default_value: string;
  hidden: boolean;
}
