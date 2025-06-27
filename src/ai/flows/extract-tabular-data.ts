'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting tabular data from text content.
 *
 * It takes a string of text extracted from a document as input and returns a structured array of objects representing the tabular data.
 * - extractTabularData - A function that handles the tabular data extraction process.
 * - ExtractTabularDataInput - The input type for the extractTabularData function.
 * - ExtractTabularDataOutput - The return type for the extractTabularData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { headers } from 'next/headers';
import { checkRateLimit, recordUsage } from '@/lib/rate-limiter';

const ExtractTabularDataInputSchema = z.object({
  textContent: z
    .string()
    .describe(
      'The full text content extracted from a document.'
    ),
  isLoggedIn: z.boolean(),
});
export type ExtractTabularDataInput = z.infer<typeof ExtractTabularDataInputSchema>;

const ExtractTabularDataOutputSchema = z.object({
  tabularData: z
    .array(z.record(z.string()))
    .describe('An array of objects representing the extracted tabular data. Each object is a row, and each key-value pair is a column name and its corresponding value.'),
});
export type ExtractTabularDataOutput = z.infer<typeof ExtractTabularDataOutputSchema>;

export async function extractTabularData(input: ExtractTabularDataInput): Promise<ExtractTabularDataOutput> {
  if (!input.isLoggedIn) {
    const ip = headers().get('x-forwarded-for') ?? '127.0.0.1';
    const { allowed } = await checkRateLimit(ip);
    if (!allowed) {
      throw new Error("You have exceeded the limit of 2 conversions per 6 hours for guest users. Please log in or upgrade to Pro for unlimited conversions.");
    }
  }
  
  const result = await extractTabularDataFlow(input);

  if (!input.isLoggedIn) {
     const ip = headers().get('x-forwarded-for') ?? '127.0.0.1';
     await recordUsage(ip);
  }

  return result;
}

const extractTabularDataPrompt = ai.definePrompt({
  name: 'extractTabularDataPrompt',
  input: {schema: ExtractTabularDataInputSchema},
  output: {schema: ExtractTabularDataOutputSchema},
  prompt: `You are an expert system for extracting accounting tables from the text content of a document.

  Given the following text, extract all tabular data and return it as a structured JSON object.

  Here is the text content:
  {{{textContent}}}
  `,
});

const extractTabularDataFlow = ai.defineFlow(
  {
    name: 'extractTabularDataFlow',
    inputSchema: ExtractTabularDataInputSchema,
    outputSchema: ExtractTabularDataOutputSchema,
  },
  async input => {
    const {output} = await extractTabularDataPrompt(input);
    if (!output) {
      // This case should be rare with structured output but it's good practice to handle it.
      return { tabularData: [] };
    }
    return output;
  }
);
