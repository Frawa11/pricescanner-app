import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, CountryCode, UserLocation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProductImage = async (
  base64Image: string, 
  country: CountryCode, 
  location?: UserLocation
): Promise<AnalysisResult> => {
  try {
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const countryContext: Record<CountryCode, { name: string, currency: string }> = {
      PE: { name: "Perú", currency: "PEN (S/)" },
      MX: { name: "México", currency: "MXN ($)" },
      CO: { name: "Colombia", currency: "COP ($)" },
      CL: { name: "Chile", currency: "CLP ($)" },
      AR: { name: "Argentina", currency: "ARS ($)" },
      US: { name: "United States", currency: "USD ($)" },
      BR: { name: "Brasil", currency: "BRL (R$)" },
      ES: { name: "España", currency: "EUR (€)" }
    };

    const ctx = countryContext[country];
    let prompt = '';

    // English Prompt (US) - Fully localized logic and headers
    if (country === 'US') {
      prompt = `
        Act as a local shopping assistant expert in the ${ctx.name}.
        Response Language: English.

        Analyze the provided image:
        1. Identify the product (Brand, Model). If the exact model is unclear, identify the generic product type.
        2. Search for prices in popular ONLINE STORES in the ${ctx.name} (currency: ${ctx.currency}).
           CRITICAL: If the exact product is not found, provide REFERENTIAL PRICES for similar items available in the US market (e.g. Amazon, Walmart, Best Buy).
        ${location ? '3. IMPORTANT: Use Google Maps to find NEARBY PHYSICAL STORES to my current location that sell this type of product.' : ''}
        
        Response Format (Markdown):
        **Product:** [Name]
        **Summary:** [Brief description of the item and its main features]
        **Estimated Online Price:** [Price Range in ${ctx.currency}]
        
        **Market Analysis:**
        Briefly summarize availability in major US retailers and where it is best to buy.
      `;
    } 
    // Portuguese Prompt (BR)
    else if (country === 'BR') {
      prompt = `
        Atue como um especialista em compras local no ${ctx.name}.
        Idioma de resposta: Português.

        Analise a imagem fornecida:
        1. Identifique o produto (Marca, Modelo). Se não for claro, estime o tipo de produto.
        2. Busque preços em LOJAS ONLINE populares no ${ctx.name} (moeda: ${ctx.currency}).
           IMPORTANTE: Se o produto exato não for encontrado, forneça PREÇOS DE REFERÊNCIA de itens similares no mercado brasileiro.
        ${location ? '3. IMPORTANTE: Use o Google Maps para encontrar LOJAS FÍSICAS PRÓXIMAS à minha localização atual que vendam este tipo de produto.' : ''}

        Formato de resposta (Markdown):
        **Produto:** [Nome]
        **Resumo:** [Breve descrição]
        **Preço Online Estimado:** [Faixa em ${ctx.currency}]

        **Análise de Mercado:**
        Resuma brevemente a disponibilidade em grandes varejistas (ex: Mercado Livre, Amazon BR, Magalu) e onde comprar.
      `;
    } 
    // Spanish Prompt (Default for Latam/Spain)
    else {
      prompt = `
        Actúa como un asistente experto en compras local en ${ctx.name}.
        Idioma de respuesta: Español.

        Analiza la imagen proporcionada:
        1. Identifica el producto (Marca, Modelo). Si la imagen no es clara o el producto es genérico, identifica el tipo de artículo.
        2. Busca precios en TIENDAS EN LÍNEA populares en ${ctx.name} (moneda: ${ctx.currency}).
           IMPORTANTE: Si no encuentras el producto exacto, busca PRECIOS REFERENCIALES de artículos similares disponibles en el mercado local.
        ${location ? '3. IMPORTANTE: Usa Google Maps para encontrar TIENDAS FÍSICAS CERCANAS a mi ubicación actual que vendan este tipo de productos.' : ''}
        
        Formato de respuesta (Markdown):
        **Producto:** [Nombre]
        **Resumen:** [Breve descripción]
        **Precio Online Estimado:** [Rango en ${ctx.currency}]
        
        **Análisis de Mercado:**
        Resume brevemente dónde conviene comprarlo y tiendas sugeridas.
      `;
    }

    // Construct tools configuration
    // IMPORTANT: googleSearch and googleMaps should be in the same Tool object if used together.
    const toolObj: any = { googleSearch: {} };
    if (location) {
      toolObj.googleMaps = {};
    }
    const tools = [toolObj];

    const config: any = {
      tools: tools
    };

    // Add retrieval config only if location is available
    if (location) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: config
    });

    const defaultError = country === 'US' ? "Could not generate info." : (country === 'BR' ? "Não foi possível gerar informações." : "No se pudo generar información.");
    const text = response.text || defaultError;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      text,
      groundingChunks
    };

  } catch (error) {
    console.error("Error analyzing product:", error);
    throw error;
  }
};