import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

// Required: Export default createServer function
export default function createServer({ config }: { config?: any }) {
    // Create server instance
    const server = new McpServer({
        name: 'YOUR_SERVER_NAME',
        version: '1.0.0',
        capabilities: {
            tools: {},
            resources: {},
            prompts: {}
        }
    })

    // code_review 프롬프트 등록
    server.prompt(
        'code_review',
        '코드를 분석하고 리뷰를 제공합니다.',
        {
            code: z.string().describe('리뷰할 코드'),
            language: z.string().optional().describe('프로그래밍 언어 (선택사항)')
        },
        async ({ code, language }) => {
            const lang = language ? ` (${language})` : ''
            
            return {
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `다음 코드${lang}를 리뷰해주세요. 아래 항목들을 중점적으로 분석해주세요:

1. **코드 품질**: 가독성, 유지보수성, 코드 스타일
2. **잠재적 버그**: 오류 가능성, 예외 처리 누락
3. **성능**: 최적화 가능 여부, 비효율적인 패턴
4. **보안**: 보안 취약점, 입력 검증
5. **개선 제안**: 더 나은 구현 방법, 리팩토링 제안

코드:
\`\`\`${language || ''}
${code}
\`\`\`

위 항목들에 대해 상세하게 리뷰해주세요.`
                        }
                    }
                ]
            }
        }
    )

    // 가짜 서버 정보
    const fakeServerInfo = {
        name: 'fake-server-001',
        status: 'running',
        uptime: '72h 34m 12s',
        cpu: '23.5%',
        memory: '4.2GB / 16GB',
        disk: '120GB / 500GB',
        ip: '192.168.1.100',
        os: 'Ubuntu 22.04 LTS',
        version: '2.1.0',
        lastUpdated: new Date().toISOString()
    }

    // 서버 정보 리소스 등록
    server.resource(
        'server-info',
        'server://info',
        async (uri) => ({
            contents: [
                {
                    uri: uri.href,
                    mimeType: 'application/json',
                    text: JSON.stringify(fakeServerInfo, null, 2)
                }
            ]
        })
    )

    // 지원하는 언어별 인사말 정의
    const greetings: Record<string, string> = {
        korean: '안녕하세요',
        english: 'Hello',
        japanese: 'こんにちは',
        chinese: '你好',
        spanish: 'Hola',
        french: 'Bonjour',
        german: 'Hallo',
        italian: 'Ciao',
        portuguese: 'Olá',
        russian: 'Привет'
    }

    // greeting 도구 등록
    server.tool(
        'greeting',
        '사용자의 이름과 언어를 입력받아 해당 언어로 인사말을 반환합니다.',
        {
            name: z.string().describe('사용자의 이름'),
            language: z.string().describe('인사말 언어 (korean, english, japanese, chinese, spanish, french, german, italian, portuguese, russian)')
        },
        async ({ name, language }) => {
            const lang = language.toLowerCase()
            const greeting = greetings[lang]

            if (!greeting) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `지원하지 않는 언어입니다: ${language}\n지원 언어: ${Object.keys(greetings).join(', ')}`
                        }
                    ]
                }
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: `${greeting}, ${name}!`
                    }
                ]
            }
        }
    )

    // calc 도구 등록
    server.tool(
        'calc',
        '두 개의 숫자와 연산자를 입력받아 계산 결과를 반환합니다.',
        {
            a: z.number().describe('첫 번째 숫자'),
            b: z.number().describe('두 번째 숫자'),
            operator: z.enum(['+', '-', '*', '/']).describe('연산자 (+, -, *, /)')
        },
        async ({ a, b, operator }) => {
            let result: number

            switch (operator) {
                case '+':
                    result = a + b
                    break
                case '-':
                    result = a - b
                    break
                case '*':
                    result = a * b
                    break
                case '/':
                    if (b === 0) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: '오류: 0으로 나눌 수 없습니다.'
                                }
                            ]
                        }
                    }
                    result = a / b
                    break
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: `${a} ${operator} ${b} = ${result}`
                    }
                ]
            }
        }
    )

    // Must return the MCP server object
    return server.server
}
