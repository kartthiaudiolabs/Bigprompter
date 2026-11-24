import { GeneratedCodeArtifact, SDKGeneratorOptions, TargetSDK } from './types';

export class SDKGenerator {
  generate(options: SDKGeneratorOptions): GeneratedCodeArtifact {
    const {
      promptText,
      targetSdk,
      language,
      streaming = false,
      temperature = 0.2,
      maxTokens = 4096,
      promptName = 'promptexa_task',
      modelName,
    } = options;

    if (language === 'typescript') {
      return this.generateTypeScript(
        targetSdk,
        promptText,
        streaming,
        temperature,
        maxTokens,
        promptName,
        modelName
      );
    } else {
      return this.generatePython(
        targetSdk,
        promptText,
        streaming,
        temperature,
        maxTokens,
        promptName,
        modelName
      );
    }
  }

  generateNextJSRoute(promptText: string, targetSdk: SDKGeneratorOptions['targetSdk'] = 'anthropic'): GeneratedCodeArtifact {
    const code = `import { NextRequest } from 'next/server';
import ${targetSdk === 'anthropic' ? "Anthropic from '@anthropic-ai/sdk'" : targetSdk === 'openai' ? "OpenAI from 'openai'" : "{ GoogleGenAI } from '@google/genai'"};

// Production Promptexa Edge Handler with Server-Sent Events (SSE) Streaming
export const runtime = 'edge';

const SYSTEM_PROMPT = ${JSON.stringify(promptText)};

export async function POST(req: NextRequest) {
  try {
    const { userInput } = await req.json();

    if (!userInput) {
      return new Response(JSON.stringify({ error: 'Missing userInput payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    ${
      targetSdk === 'anthropic'
        ? `const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const fullPrompt = \`\${SYSTEM_PROMPT}\\n\\n<untrusted_user_input>\\n\${userInput}\\n</untrusted_user_input>\`;

    const stream = await client.messages.stream({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 4096,
      messages: [{ role: 'user', content: fullPrompt }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && (chunk.delta as any)?.text) {
            controller.enqueue(encoder.encode(\`data: \${JSON.stringify({ text: (chunk.delta as any).text })}\\n\\n\`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\\n\\n'));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });`
        : targetSdk === 'openai'
        ? `const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const fullPrompt = \`\${SYSTEM_PROMPT}\\n\\n<untrusted_user_input>\\n\${userInput}\\n</untrusted_user_input>\`;

    const stream = await client.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      stream: true,
      messages: [{ role: 'user', content: fullPrompt }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || '';
          if (delta) {
            controller.enqueue(encoder.encode(\`data: \${JSON.stringify({ text: delta })}\\n\\n\`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\\n\\n'));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });`
        : `const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const fullPrompt = \`\${SYSTEM_PROMPT}\\n\\n<untrusted_user_input>\\n\${userInput}\\n</untrusted_user_input>\`;
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of responseStream) {
          if (chunk.text) {
            controller.enqueue(encoder.encode(\`data: \${JSON.stringify({ text: chunk.text })}\\n\\n\`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\\n\\n'));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });`
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
`;

    return {
      filename: 'route.ts',
      language: 'typescript',
      code,
      description: 'Production Next.js App Router Route Handler with SSE streaming.',
      dependencies: [targetSdk === 'anthropic' ? '@anthropic-ai/sdk' : targetSdk === 'openai' ? 'openai' : '@google/genai'],
      installCommand: `bun add ${targetSdk === 'anthropic' ? '@anthropic-ai/sdk' : targetSdk === 'openai' ? 'openai' : '@google/genai'}`,
    };
  }

  generateCurl(promptText: string, targetSdk: SDKGeneratorOptions['targetSdk'] = 'anthropic'): GeneratedCodeArtifact {
    let curlScript = '';
    if (targetSdk === 'anthropic') {
      curlScript = `curl https://api.anthropic.com/v1/messages \\
  -H "content-type: application/json" \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "claude-3-7-sonnet-20250219",
    "max_tokens": 4096,
    "messages": [
      {
        "role": "user",
        "content": ${JSON.stringify(promptText + '\n\n<untrusted_user_input>\nSample user task payload\n</untrusted_user_input>')}
      }
    ]
  }'`;
    } else if (targetSdk === 'openai') {
      curlScript = `curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -d '{
    "model": "gpt-4o",
    "temperature": 0.2,
    "messages": [
      {
        "role": "user",
        "content": ${JSON.stringify(promptText + '\n\n<untrusted_user_input>\nSample user task payload\n</untrusted_user_input>')}
      }
    ]
  }'`;
    } else {
      curlScript = `curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GEMINI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [
      {
        "parts": [
          { "text": ${JSON.stringify(promptText + '\n\n<untrusted_user_input>\nSample user task payload\n</untrusted_user_input>')} }
        ]
      }
    ]
  }'`;
    }

    return {
      filename: 'execute.sh',
      language: 'bash',
      code: curlScript,
      description: 'Zero-dependency cURL terminal execution command.',
      dependencies: ['curl'],
      installCommand: '# No installation required (standard Unix tool)',
    };
  }

  generateLangChainYAML(promptText: string, promptName: string = 'promptexa_pipeline'): GeneratedCodeArtifact {
    const yaml = `# Promptexa LangChain & PromptFoo Pipeline Manifest
name: "${promptName}"
version: "1.0.0"
description: "Compiled L4 Production Prompt engineered with Promptexa"

prompts:
  - id: "${promptName}_v1"
    raw: |
${promptText
  .split('\n')
  .map((line) => `      ${line}`)
  .join('\n')}

providers:
  - id: anthropic:claude-3-7-sonnet-20250219
    config:
      temperature: 0.2
      max_tokens: 4096
  - id: openai:gpt-4o
    config:
      temperature: 0.2

tests:
  - vars:
      USER_PAYLOAD: "Execute standard verification run"
    assert:
      - type: not-contains
        value: "Certainly!"
      - type: contains
        value: "###"
`;

    return {
      filename: 'promptfoo.config.yaml',
      language: 'yaml',
      code: yaml,
      description: 'LangChain & PromptFoo CI/CD automated evaluation config.',
      dependencies: ['promptfoo'],
      installCommand: 'npm install -g promptfoo',
    };
  }

  private generateTypeScript(
    targetSdk: TargetSDK,
    promptText: string,
    streaming: boolean,
    temperature: number,
    maxTokens: number,
    promptName: string,
    modelName?: string
  ): GeneratedCodeArtifact {
    let code = '';
    let dependencies: string[] = [];
    let installCommand = '';
    const filename = `${promptName.toLowerCase().replace(/[^a-z0-9_]/g, '_')}.ts`;

    if (targetSdk === 'anthropic') {
      dependencies = ['@anthropic-ai/sdk'];
      installCommand = 'bun add @anthropic-ai/sdk';
      const model = modelName || 'claude-3-7-sonnet-20250219';

      code = `import Anthropic from '@anthropic-ai/sdk';

/**
 * Promptexa Generated Production Client for Anthropic Claude
 */
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const COMPILED_PROMPT = ${JSON.stringify(promptText)};

export async function executePrompt(userInput: string) {
  const fullPrompt = \`\${COMPILED_PROMPT}\\n\\n<untrusted_user_input>\\n\${userInput}\\n</untrusted_user_input>\`;

  ${
    streaming
      ? `const stream = await client.messages.stream({
    model: '${model}',
    max_tokens: ${maxTokens},
    messages: [{ role: 'user', content: fullPrompt }],
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && (event.delta as any)?.text) {
      process.stdout.write((event.delta as any).text);
    }
  }
  const finalMessage = await stream.finalMessage();
  return finalMessage;`
      : `const message = await client.messages.create({
    model: '${model}',
    max_tokens: ${maxTokens},
    messages: [{ role: 'user', content: fullPrompt }],
  });

  const outputText = message.content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('\\n');

  return outputText;`
  }
}

// Example Execution
if (require.main === module) {
  executePrompt('Provide sample domain input to test prompt execution.')
    .then((result) => console.log(result))
    .catch(console.error);
}
`;
    } else if (targetSdk === 'openai') {
      dependencies = ['openai'];
      installCommand = 'bun add openai';
      const model = modelName || 'gpt-4o';

      code = `import OpenAI from 'openai';

/**
 * Promptexa Generated Production Client for OpenAI
 */
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const COMPILED_PROMPT = ${JSON.stringify(promptText)};

export async function executePrompt(userInput: string) {
  const fullPrompt = \`\${COMPILED_PROMPT}\\n\\n<untrusted_user_input>\\n\${userInput}\\n</untrusted_user_input>\`;

  ${
    streaming
      ? `const stream = await client.chat.completions.create({
    model: '${model}',
    temperature: ${temperature},
    stream: true,
    messages: [{ role: 'user', content: fullPrompt }],
  });

  let fullResponse = '';
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || '';
    process.stdout.write(text);
    fullResponse += text;
  }
  return fullResponse;`
      : `const response = await client.chat.completions.create({
    model: '${model}',
    temperature: ${temperature},
    messages: [{ role: 'user', content: fullPrompt }],
  });

  return response.choices[0]?.message?.content || '';`
  }
}

// Example Execution
if (require.main === module) {
  executePrompt('Provide sample domain input to test prompt execution.')
    .then((result) => console.log(result))
    .catch(console.error);
}
`;
    } else {
      dependencies = ['@google/genai'];
      installCommand = 'bun add @google/genai';
      const model = modelName || 'gemini-2.5-flash';

      code = `import { GoogleGenAI } from '@google/genai';

/**
 * Promptexa Generated Production Client for Google Gemini
 */
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const COMPILED_PROMPT = ${JSON.stringify(promptText)};

export async function executePrompt(userInput: string) {
  const fullPrompt = \`\${COMPILED_PROMPT}\\n\\n<untrusted_user_input>\\n\${userInput}\\n</untrusted_user_input>\`;

  ${
    streaming
      ? `const responseStream = await ai.models.generateContentStream({
    model: '${model}',
    contents: fullPrompt,
  });

  let fullResponse = '';
  for await (const chunk of responseStream) {
    if (chunk.text) {
      process.stdout.write(chunk.text);
      fullResponse += chunk.text;
    }
  }
  return fullResponse;`
      : `const response = await ai.models.generateContent({
    model: '${model}',
    contents: fullPrompt,
  });

  return response.text;`
  }
}

// Example Execution
if (require.main === module) {
  executePrompt('Provide sample domain input to test prompt execution.')
    .then((result) => console.log(result))
    .catch(console.error);
}
`;
    }

    return {
      filename,
      language: 'typescript',
      code,
      description: `Production TypeScript client utilizing ${dependencies[0]} with isolated input delimiters.`,
      dependencies,
      installCommand,
    };
  }

  private generatePython(
    targetSdk: TargetSDK,
    promptText: string,
    streaming: boolean,
    temperature: number,
    maxTokens: number,
    promptName: string,
    modelName?: string
  ): GeneratedCodeArtifact {
    let code = '';
    let dependencies: string[] = [];
    let installCommand = '';
    const filename = `${promptName.toLowerCase().replace(/[^a-z0-9_]/g, '_')}.py`;

    if (targetSdk === 'anthropic') {
      dependencies = ['anthropic'];
      installCommand = 'pip install anthropic';
      const model = modelName || 'claude-3-7-sonnet-20250219';

      code = `import os
import anthropic

# Initialize Anthropic Client from Environment Variable
client = anthropic.Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)

COMPILED_PROMPT = ${JSON.stringify(promptText)}

def execute_prompt(user_input: str) -> str:
    """Executes the Promptexa engineered prompt against Claude."""
    full_prompt = f"{COMPILED_PROMPT}\\n\\n<untrusted_user_input>\\n{user_input}\\n</untrusted_user_input>"

    ${
      streaming
        ? `response_text = ""
    with client.messages.stream(
        model="${model}",
        max_tokens=${maxTokens},
        messages=[{"role": "user", "content": full_prompt}],
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)
            response_text += text
    print()
    return response_text`
        : `message = client.messages.create(
        model="${model}",
        max_tokens=${maxTokens},
        messages=[{"role": "user", "content": full_prompt}],
    )
    return "\\n".join([b.text for b in message.content if b.type == "text"])`
    }

if __name__ == "__main__":
    result = execute_prompt("Provide sample domain input to test prompt execution.")
    print(result)
`;
    } else if (targetSdk === 'openai') {
      dependencies = ['openai'];
      installCommand = 'pip install openai';
      const model = modelName || 'gpt-4o';

      code = `import os
from openai import OpenAI

# Initialize OpenAI Client
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY")
)

COMPILED_PROMPT = ${JSON.stringify(promptText)}

def execute_prompt(user_input: str) -> str:
    """Executes the Promptexa engineered prompt against OpenAI."""
    full_prompt = f"{COMPILED_PROMPT}\\n\\n<untrusted_user_input>\\n{user_input}\\n</untrusted_user_input>"

    ${
      streaming
        ? `response_text = ""
    stream = client.chat.completions.create(
        model="${model}",
        temperature=${temperature},
        stream=True,
        messages=[{"role": "user", "content": full_prompt}],
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content or ""
        print(delta, end="", flush=True)
        response_text += delta
    print()
    return response_text`
        : `response = client.chat.completions.create(
        model="${model}",
        temperature=${temperature},
        messages=[{"role": "user", "content": full_prompt}],
    )
    return response.choices[0].message.content or ""`
    }

if __name__ == "__main__":
    result = execute_prompt("Provide sample domain input to test prompt execution.")
    print(result)
`;
    } else {
      dependencies = ['google-genai'];
      installCommand = 'pip install google-genai';
      const model = modelName || 'gemini-2.5-flash';

      code = `import os
from google import genai

# Initialize Google Gemini Client
client = genai.Client(
    api_key=os.environ.get("GEMINI_API_KEY")
)

COMPILED_PROMPT = ${JSON.stringify(promptText)}

def execute_prompt(user_input: str) -> str:
    """Executes the Promptexa engineered prompt against Google Gemini."""
    full_prompt = f"{COMPILED_PROMPT}\\n\\n<untrusted_user_input>\\n{user_input}\\n</untrusted_user_input>"

    ${
      streaming
        ? `response_text = ""
    response_stream = client.models.generate_content_stream(
        model="${model}",
        contents=full_prompt,
    )
    for chunk in response_stream:
        if chunk.text:
            print(chunk.text, end="", flush=True)
            response_text += chunk.text
    print()
    return response_text`
        : `response = client.models.generate_content(
        model="${model}",
        contents=full_prompt,
    )
    return response.text or ""`
    }

if __name__ == "__main__":
    result = execute_prompt("Provide sample domain input to test prompt execution.")
    print(result)
`;
    }

    return {
      filename,
      language: 'python',
      code,
      description: `Production Python script utilizing ${dependencies[0]} with isolated input delimiters.`,
      dependencies,
      installCommand,
    };
  }
}

export const sdkGenerator = new SDKGenerator();
