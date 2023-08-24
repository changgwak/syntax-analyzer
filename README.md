![og-image](https://github.com/romantech/syntax-analyzer/assets/8604840/747803a5-7670-4c18-99b8-07c4245b5312)

Syntax Analyzer는 영어 문장의 다양한 구문(주어, 동사, 목적어, 절, 구 등)을 자동으로 분석해 주고, 분석한 구문을 원하는 형태로 편집할 수 있는 웹 어플리케이션입니다. 자주 사용하는 30여 가지의 문장 성분 태그를 통해 복잡한 문장 구조를 한눈에 파악할 수 있습니다. 입력한 주제와 연관된 랜덤 문장 생성 기능도 제공합니다. 구문 분석과 랜덤 문장 생성은 직접 작성한 프롬프트와 OpenAI를 활용했습니다.

- 어플리케이션 링크 : [https://syntax-analyzer.romantech.net](https://syntax-analyzer.romantech.net/)
- 백엔드 레포지토리 : https://github.com/romantech/project-server

# 목차
- [사용 스택](#사용-스택)
    - [Frontend](#frontend)
    - [Backend](#backend)
- [주요 기능](#주요-기능)
- [분석 데이터 생성 흐름](#분석-데이터-생성-흐름)
- [구문 분석기 구현 방식](#구문-분석기-구현-방식)
- [문장 성분 목록](#문장-성분-목록)
- [스크린샷](#스크린샷)

# 사용 스택

### Frontend

- **Framework**: React with Typescript
- **UI Library**: Chakra UI
- **CSS Preprocessor**: SCSS
- **State Management**: Jotai / React Query
- **Form Handling**: React Hook Form / Yup
- **Animation**: Framer Motion / Lottie

### Backend

- **Framework**: Express with Typescript
- **Database & Cache**: Redis (using ioredis)
- **Syntax Analysis**: OpenAI

# 주요 기능
> I'll 같은 축약 표현은 자동으로 풀어서 분석합니다 e.g. I'll -> I will
1. 영어 구문 분석 : 주어, 동사, 목적어, 절, 구 등 문장 성분 분석
2. 영어 구문 편집기 : 30여 가지의 구성 요소 태그를 이용한 문장 구조 시각화
3. 영어 문장 생성 : 입력한 주제와 연관된 랜덤 문장 생성

# 분석 데이터 생성 흐름

```mermaid
sequenceDiagram
    autonumber

    participant C as React Client
    participant S as Express Server
    participant R as Redis DB
    participant O as OpenAI API

    C->>S: Request analysis #32;#32;

    activate S

    S->S: Validate request
    Note right of S: Verify IP and fields #32;

    alt Invalid Request
        S-->>C: 400 Bad Request

    else Valid Request
        S->>+R: Get analysis quota
        R-->>-S: Return analysis quota
        S->S: Verify analysis quota

        break If Limit Reached
            S-->>C: 400 Limit Exceeded
        end

        else Continue
            S->>+R: Retrieve prompt
            R-->>-S: Return prompt

            critical Process with OpenAI
                S->>+O: Create chat completion
                O-->>-S: Return analysis result
            end

            S->>R: Update request count
            Note over S,R: GPT 3.5 reduced by 1#59; GPT 4 reduced by 3 #32;#32;#32;

            S-->>C: 200 OK with analysis data
            deactivate S
    end
```

# 구문 분석기 구현 방식
먼저, 입력받은 문장의 토큰화 과정을 통해 각 단어를 최소 단위로 분리합니다. 이렇게 분리한 단어들은 루트(최상위) 세그먼트에 포함시켜 그래프 구조로 관리합니다. 각 세그먼트는 시작과 끝에 대한 토큰 인덱스 정보를 가집니다. 문장 성분을 추가할 땐 지정된 인덱스 범위에 따라 기존 세그먼트를 탐색하거나 필요에 따라 새로운 세그먼트를 생성하고 결합합니다. 

1. 시작-끝 범위가 현재 세그먼트 범위와 일치할 때: 해당 세그먼트에 추가
2. 시작-끝 범위가 현재 세그먼트 범위보다 작을 때: 자식 세그먼트 중 해당 범위를 포함하는 세그먼트 탐색
3. 시작-끝 범위를 포함하는 자식 세그먼트가 없을 때: 자식 세그먼트를 결합하여 새로운 세그먼트 생성
4. 자식 세그먼트가 하나도 없을 때: 새로운 세그먼트 생성

아래는 "Global warming is a significant issue" 문장의 간단한 구문 분석 예시입니다.

<img width="2331" alt="syntax-parser-implementation" src="https://github.com/romantech/syntax-analyzer/assets/8604840/41759f01-c8be-49e2-989e-710001e5e152">

# 문장 성분 목록
영어 문장은 아래 구성 요소를 기준으로 분석되며, 구문 편집기의 태그로도 활용됩니다. 약어와 설명은 편집기의 툴팁으로 표시됩니다. 1단어는 토큰(token), 2단어 이상은 유형에 따라 구(phrase) 혹은 절(clause)로 구분합니다. 

| 라벨         | 약어 | 타입   | 설명                                                |
| ------------- | ------------ | ------ | ---------------------------------------------------------- |
| 주어          | s            | token  | 문장에서 동작이나 상태의 주체를 나타내는 단어나 구         |
| 동사          | v            | token  | 문장에서 동작, 상태, 또는 사건을 표현하는 단어             |
| 조동사        | aux.v        | token  | 다른 동사와 함께 사용되어 동작, 상태, 관계를 나타내는 동사 |
| 법조동사      | mod.v        | token  | 가능성, 허락, 의무 등을 나타내는 동사                      |
| 목적어        | o            | token  | 동사의 동작이나 상태에 영향을 받는 단어나 구               |
| 간접 목적어   | i.o.         | token  | 동사의 동작이 미치는 대상을 나타내는 단어나 구             |
| 직접 목적어   | d.o.         | token  | 동사의 동작이 직접적으로 영향을 주는 단어나 구             |
| 전치사 목적어 | prp.o.       | token  | 전치사에 의해 소개되는 단어나 구                           |
| 보어          | c            | token  | 주어나 목적어를 설명하거나 보완하는 단어나 구              |
| 목적보어      | o.c.         | token  | 목적어를 설명하거나 보완하는 단어나 구                     |
| to부정사      | t-inf        | token  | 'to'와 함께 사용되는 동사의 기본형                         |
| 부정사 목적어 | inf.o.       | token  | 부정사 동사의 동작이나 상태에 영향을 받는 단어나 구        |
| 동명사        | g            | token  | 동사에 -ing 형태를 더해 명사로 사용하는 형태               |
| 동명사 목적어 | g.o.         | phrase | 동명사의 동작이나 상태에 영향을 받는 단어나 구             |
| 분사          | pt           | token  | 동사의 과거 분사나 현재 분사 형태                          |
| 분사 목적어   | pt.o.        | phrase | 분사 동작의 대상이 되는 단어나 구                          |
| 분사 구문     | pt.phr       | phrase | 분사와 그 관련 구성요소로 이루어진 구문                    |
| 전치사구      | prp.phr      | phrase | 전치사와 그 객체로 이루어진 구문                           |
| 부사구        | adv.phr      | phrase | 문장 내에서 부사의 역할을 하는 구문                        |
| 형용사구      | adj.phr      | phrase | 문장 내에서 형용사의 역할을 하는 구문                      |
| 등위 접속사   | co.t         | phrase | 동일한 문법적 가치를 가진 구나 절을 연결하는 접속사        |
| 등위절        | co.cl        | clause | 동일한 중요도를 가진 두 개 이상의 절                       |
| 병렬절        | p.cl         | clause | 동일한 문법 구조를 갖는 두 개 이상의 절                    |
| 명사절        | n.cl         | clause | 문장에서 명사 역할을 하는 절                               |
| 형용사절      | adj.cl       | clause | 문장에서 형용사 역할을 하는 절                             |
| 부사절        | adv.cl       | clause | 문장에서 부사 역할을 하는 절                               |
| 삽입절        | i.cl         | clause | 다른 절 속에 삽입된 절                                     |
| 관계절        | rel.cl       | clause | 주절에 관계된 세부 정보를 제공하는 절                      |
| 종속절        | dep.cl       | clause | 다른 절에 의존하여 완전한 의미를 가질 수 없는 절           |
| 독립절        | ind.cl       | clause | 다른 절에 의존하지 않고 독립적으로 완전한 의미를 가진 절   |

# 스크린샷

#### 홈 화면

![home](https://github.com/romantech/syntax-analyzer/assets/8604840/b09f7777-e0c9-48aa-9ad4-5de85e8eb106)

#### 영어 구문 분석 요청 양식

![analysis-16-9](https://github.com/romantech/syntax-analyzer/assets/8604840/1a2e169b-d4f8-4792-8816-be42cfb153f6)

#### 영어 구문 편집기

![editor-16-9](https://github.com/romantech/syntax-analyzer/assets/8604840/5eb8336b-fdc1-4ed0-aa0b-a88a7e576a57)

#### 랜덤 문장 생성

![generator-16-9](https://github.com/romantech/syntax-analyzer/assets/8604840/114fb4e4-e29a-4f65-a8c7-b9d963b39dbf)
