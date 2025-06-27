'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting tabular data from a PDF.
 *
 * It takes a PDF data URI as input and returns a JSON string representing the extracted tabular data.
 * @fileOverview This file defines a Genkit flow for extracting tabular data from a PDF.
 *
 * - extractTabularData - A function that handles the tabular data extraction process.
 * - ExtractTabularDataInput - The input type for the extractTabularData function.
 * - ExtractTabularDataOutput - The return type for the extractTabularData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTabularDataInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      'A PDF file as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type ExtractTabularDataInput = z.infer<typeof ExtractTabularDataInputSchema>;

const ExtractTabularDataOutputSchema = z.object({
  tabularData: z
    .string()
    .describe('A JSON string representing the extracted tabular data.'),
});
export type ExtractTabularDataOutput = z.infer<typeof ExtractTabularDataOutputSchema>;

export async function extractTabularData(input: ExtractTabularDataInput): Promise<ExtractTabularDataOutput> {
  return extractTabularDataFlow(input);
}

const extractTabularDataPrompt = ai.definePrompt({
  name: 'extractTabularDataPrompt',
  input: {schema: ExtractTabularDataInputSchema},
  output: {schema: ExtractTabularDataOutputSchema},
  prompt: `You are an expert system for extracting accounting tables from PDF documents.

  Given the following PDF document, extract all tabular data and return it as a JSON string.

  Here is the PDF document:
  {{media url=pdfDataUri}}
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
    return output!;
  }
);
