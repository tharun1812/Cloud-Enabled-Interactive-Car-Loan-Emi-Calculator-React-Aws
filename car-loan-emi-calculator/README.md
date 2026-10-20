# Car Loan EMI Calculator

A React + TypeScript web app that calculates the monthly EMI for a car loan, shows how much interest the loan costs,
and produces a full repayment schedule. Includes an AWS CloudFormation template for hosting it on EC2 inside a VPC with
least-privilege IAM and a locked-down security group.

> **About this repository.** This is a clean, documented rebuild of the project I first made during my B.E. (second year)
> at Sathyabama Institute of Science and Technology. The code here was written in 2026 and the Git history reflects that.

## Features

- Car price, down payment, interest rate and tenure (years or months) with synced sliders
- EMI, total interest and total payable, calculated with the standard reducing-balance formula
- Stacked yearly chart showing principal vs interest, and a year-by-year schedule that expands to months
- CSV export of the full schedule
- Input validation with clear messages (down payment must be below price, rate and tenure limits, empty fields)
- Keyboard accessible, screen-reader labels, responsive layout
- 16 unit tests for the maths (checked against independent high-precision reference values)

## The maths

```
EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)
P = loan amount (price − down payment)   r = annual rate / 12 / 100   n = months
```

Each month: `interest = balance × r`, `principal = EMI − interest`. The final instalment absorbs rounding drift so the
balance ends at exactly ₹0. With a 0% rate the EMI is simply `P / n`.

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · Vitest · AWS (VPC, EC2, IAM, Security Groups, S3, CloudFormation)

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests
npm run build      # type-check + production build into dist/
```

## Project structure

```
src/
  lib/emi.ts          EMI, schedule and validation logic (pure functions)
  lib/emi.test.ts     unit tests
  lib/format.ts       INR formatting
  lib/csv.ts          CSV export
  components/         Field, Summary, YearlyChart, ScheduleTable
  App.tsx             state and layout
deploy/aws/cloudformation.yaml   VPC, subnet, IGW, security group, IAM role, EC2
docs/AWS_DEPLOYMENT.md           step-by-step deployment guide
```

## Deployment

See [docs/AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md). Security choices: port 22 closed (SSM Session Manager instead),
IMDSv2 required, instance role limited to read-only access on one S3 prefix.

**Live demo:** _add your URL here after you deploy it_

## Limitations

Estimates only. Real lenders add processing fees, insurance and may round differently. Tenure is capped at 10 years.
