"use client";

import React, { Component } from "react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
}

export class Loader extends Component<LoaderProps> {
  render() {
    const { className } = this.props;

    return (
      <div
        className={cn(
          "fixed inset-0 flex items-center justify-center bg-background dark:bg-slate-900 text-foreground dark:text-slate-100",
          className
        )}
      >
        <div className="relative flex items-center justify-center">
          {/* Diagonal Progress Animation */}
          <div className="absolute w-16 h-16 border-4 border-transparent border-t-primary border-r-primary dark:border-t-blue-500 dark:border-r-blue-500 rounded-full animate-spin" />

          {/* Centered 'C' */}
          <span className="text-4xl font-bold tracking-tight">C</span>
        </div>
      </div>
    );
  }
}

export default Loader;
