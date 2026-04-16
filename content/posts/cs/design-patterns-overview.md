---
title: 디자인 패턴 완전 정리 — 생성, 구조, 행동 패턴의 개요와 실전 예시
date: 2026-04-12
updated: 2026-04-12
tags:
  - design-patterns
  - software-engineering
  - oop
  - architecture
  - creational-patterns
  - structural-patterns
  - behavioral-patterns
  - singleton
  - factory
  - observer
  - strategy
  - decorator
  - refactoring
  - best-practices
  - fundamentals
summary: "GoF 디자인 패턴 23가지를 생성, 구조, 행동 세 범주로 나눠 각 패턴의 목적, 특장점, 코드 예시까지 한눈에 정리"
devto: false
devto_id:
devto_url:
ai_agent: Claude-Code
---

# 디자인 패턴 완전 정리 — 생성, 구조, 행동 패턴의 개요와 실전 예시

_written by Claude-Code_

## 디자인 패턴이란?

**디자인 패턴(Design Pattern)**은 소프트웨어 설계에서 자주 반복되는 문제들에 대한 **검증된 해결책 템플릿**이다.

1994년 GoF(Gang of Four — Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides)가 쓴 《Design Patterns》에서 23개의 패턴을 정리하면서 업계 표준으로 자리 잡았다.

> 패턴은 코드를 복사·붙여넣기 하는 게 아니라, 상황에 맞게 적용하는 **설계 어휘**다.

---

## 세 가지 범주

| 범주 | 핵심 질문 | 대표 패턴 수 |
|------|-----------|-------------|
| **생성 (Creational)** | "객체를 어떻게 만들까?" | 5가지 |
| **구조 (Structural)** | "클래스와 객체를 어떻게 조합할까?" | 7가지 |
| **행동 (Behavioral)** | "객체 간 책임과 통신을 어떻게 나눌까?" | 11가지 |

---

## 1. 생성 패턴 (Creational Patterns)

객체 생성 방식을 **캡슐화**해 코드와 구체 클래스 간 결합도를 낮춘다.

---

### 1-1. Singleton (싱글턴)

**목적**: 클래스의 인스턴스가 오직 하나만 존재하도록 보장하고, 전역 접근점을 제공한다.

**특장점**
- 전역 상태를 하나의 객체로 일관되게 관리
- 인스턴스 생성 비용이 클 때 자원 절약 (DB 연결, 설정 관리 등)

**단점**
- 전역 상태 공유로 테스트 어려움
- 멀티스레드 환경에서 동기화 필요

```python
class DatabaseConnection:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.connect()
        return cls._instance

    def connect(self):
        print("DB 연결 수립")

db1 = DatabaseConnection()
db2 = DatabaseConnection()
print(db1 is db2)  # True — 같은 인스턴스
```

---

### 1-2. Factory Method (팩토리 메서드)

**목적**: 객체 생성 인터페이스를 정의하되, 어떤 클래스를 인스턴스화할지는 서브클래스가 결정하게 한다.

**특장점**
- 새로운 타입 추가 시 기존 코드 수정 불필요 (OCP 원칙)
- 생성 로직을 한 곳에 집중

```python
from abc import ABC, abstractmethod

class Notification(ABC):
    @abstractmethod
    def send(self, message: str): ...

class EmailNotification(Notification):
    def send(self, message: str):
        print(f"[이메일] {message}")

class SMSNotification(Notification):
    def send(self, message: str):
        print(f"[SMS] {message}")

class NotificationFactory:
    @staticmethod
    def create(channel: str) -> Notification:
        if channel == "email":
            return EmailNotification()
        elif channel == "sms":
            return SMSNotification()
        raise ValueError(f"알 수 없는 채널: {channel}")

noti = NotificationFactory.create("email")
noti.send("회원가입을 환영합니다!")
```

---

### 1-3. Builder (빌더)

**목적**: 복잡한 객체의 생성 과정을 단계별로 분리해 동일한 생성 절차로 다양한 표현을 만든다.

**특장점**
- 생성자 인자가 많을 때 가독성 향상
- 필수/선택 파라미터를 명확하게 구분 가능

```python
class QueryBuilder:
    def __init__(self):
        self._table = ""
        self._conditions = []
        self._limit = None

    def from_table(self, table: str):
        self._table = table
        return self  # 메서드 체이닝

    def where(self, condition: str):
        self._conditions.append(condition)
        return self

    def limit(self, n: int):
        self._limit = n
        return self

    def build(self) -> str:
        sql = f"SELECT * FROM {self._table}"
        if self._conditions:
            sql += " WHERE " + " AND ".join(self._conditions)
        if self._limit:
            sql += f" LIMIT {self._limit}"
        return sql

query = (
    QueryBuilder()
    .from_table("users")
    .where("age > 18")
    .where("active = true")
    .limit(10)
    .build()
)
# SELECT * FROM users WHERE age > 18 AND active = true LIMIT 10
```

---

### 1-4. Prototype (프로토타입)

**목적**: 기존 객체를 복사(clone)해 새 객체를 생성한다.

**특장점**
- 초기화 비용이 큰 객체를 빠르게 복제
- 런타임에 동적으로 클래스를 결정할 때 유용

```python
import copy

class Config:
    def __init__(self, settings: dict):
        self.settings = settings

    def clone(self):
        return copy.deepcopy(self)

base_config = Config({"theme": "dark", "lang": "ko", "timeout": 30})
user_config = base_config.clone()
user_config.settings["theme"] = "light"  # 원본 변경 없음
```

---

### 1-5. Abstract Factory (추상 팩토리)

**목적**: 연관된 객체 군(family)을 일관되게 생성하는 인터페이스를 제공한다.

**특장점**
- UI 테마처럼 "관련 객체 세트"를 통째로 교체할 때 유용
- 제품군 간 호환성 보장

```python
# Windows UI vs Mac UI 예시
class Button(ABC):
    @abstractmethod
    def render(self): ...

class WindowsButton(Button):
    def render(self): print("Windows 버튼 렌더링")

class MacButton(Button):
    def render(self): print("Mac 버튼 렌더링")

class UIFactory(ABC):
    @abstractmethod
    def create_button(self) -> Button: ...

class WindowsFactory(UIFactory):
    def create_button(self): return WindowsButton()

class MacFactory(UIFactory):
    def create_button(self): return MacButton()
```

---

## 2. 구조 패턴 (Structural Patterns)

클래스와 객체를 더 큰 구조로 조합하되 **유연성과 효율성**을 유지한다.

---

### 2-1. Adapter (어댑터)

**목적**: 호환되지 않는 인터페이스를 가진 클래스들이 함께 동작하도록 변환한다.

**특장점**
- 레거시 코드를 수정하지 않고 재사용 가능
- 서드파티 라이브러리 통합 시 필수

```python
# 기존 라이브러리: XML 반환
class LegacyAnalytics:
    def get_report_xml(self) -> str:
        return "<report><visits>1000</visits></report>"

# 현재 시스템: JSON 기대
class AnalyticsAdapter:
    def __init__(self, legacy: LegacyAnalytics):
        self._legacy = legacy

    def get_report_json(self) -> dict:
        xml = self._legacy.get_report_xml()
        # XML → dict 변환 로직 (간략화)
        return {"visits": 1000}

adapter = AnalyticsAdapter(LegacyAnalytics())
print(adapter.get_report_json())  # {'visits': 1000}
```

---

### 2-2. Decorator (데코레이터)

**목적**: 객체에 새로운 기능을 **동적으로 추가**한다. 서브클래싱의 대안.

**특장점**
- 기존 클래스 수정 없이 기능 확장 (OCP 준수)
- 여러 데코레이터를 중첩해 조합 가능

```python
class TextProcessor:
    def process(self, text: str) -> str:
        return text

class UpperCaseDecorator:
    def __init__(self, processor):
        self._processor = processor

    def process(self, text: str) -> str:
        return self._processor.process(text).upper()

class TrimDecorator:
    def __init__(self, processor):
        self._processor = processor

    def process(self, text: str) -> str:
        return self._processor.process(text).strip()

# 체이닝: trim → uppercase
pipeline = UpperCaseDecorator(TrimDecorator(TextProcessor()))
print(pipeline.process("  hello world  "))  # "HELLO WORLD"
```

---

### 2-3. Facade (퍼사드)

**목적**: 복잡한 서브시스템에 대한 **단순화된 인터페이스**를 제공한다.

**특장점**
- 복잡도를 감추고 진입점을 단순화
- 레이어 간 의존성 최소화

```python
class VideoConverter:
    """복잡한 영상 처리 서브시스템을 하나의 메서드로 감싼다"""
    def __init__(self):
        self._decoder = VideoDecoder()
        self._encoder = VideoEncoder()
        self._audio = AudioMixer()

    def convert(self, file: str, target_format: str) -> str:
        raw = self._decoder.decode(file)
        mixed = self._audio.mix(raw)
        return self._encoder.encode(mixed, target_format)
        # 사용자는 내부 구조를 알 필요 없음

converter = VideoConverter()
converter.convert("input.avi", "mp4")
```

---

### 2-4. Composite (컴포지트)

**목적**: 개별 객체와 복합 객체를 **동일하게 다룰 수 있는 트리 구조**를 구성한다.

**특장점**
- 파일 시스템, 조직도, UI 컴포넌트 트리 등 계층 구조에 적합
- 클라이언트 코드가 단일/복합 객체를 구분할 필요 없음

```python
class FileSystemItem(ABC):
    @abstractmethod
    def get_size(self) -> int: ...

class File(FileSystemItem):
    def __init__(self, size: int):
        self._size = size

    def get_size(self) -> int:
        return self._size

class Folder(FileSystemItem):
    def __init__(self):
        self._items: list[FileSystemItem] = []

    def add(self, item: FileSystemItem):
        self._items.append(item)

    def get_size(self) -> int:
        return sum(item.get_size() for item in self._items)

root = Folder()
root.add(File(100))
docs = Folder()
docs.add(File(200))
docs.add(File(300))
root.add(docs)
print(root.get_size())  # 600
```

---

### 2-5. Proxy (프록시)

**목적**: 다른 객체에 대한 **대리자(대행자)**를 제공해 접근을 제어한다.

**특장점**
- 지연 초기화(Lazy initialization), 캐싱, 접근 제어, 로깅 등에 활용
- 원본 클래스 인터페이스를 그대로 유지

```python
class ImageLoader:
    def load(self, path: str) -> bytes:
        print(f"디스크에서 {path} 로딩 (느림)")
        return b"image_data"

class CachedImageLoader:
    def __init__(self):
        self._loader = ImageLoader()
        self._cache: dict[str, bytes] = {}

    def load(self, path: str) -> bytes:
        if path not in self._cache:
            self._cache[path] = self._loader.load(path)
        else:
            print(f"캐시에서 {path} 반환 (빠름)")
        return self._cache[path]
```

---

## 3. 행동 패턴 (Behavioral Patterns)

객체 간 **알고리즘과 책임 분배** 방식을 다룬다.

---

### 3-1. Observer (옵저버)

**목적**: 객체의 상태 변화 시 의존하는 여러 객체에게 **자동으로 알림**을 전달한다.

**특장점**
- 발행-구독(pub-sub) 구조의 기반
- 이벤트 시스템, 실시간 UI 업데이트에 적합

```python
class EventEmitter:
    def __init__(self):
        self._subscribers: dict[str, list] = {}

    def on(self, event: str, callback):
        self._subscribers.setdefault(event, []).append(callback)

    def emit(self, event: str, data=None):
        for callback in self._subscribers.get(event, []):
            callback(data)

emitter = EventEmitter()
emitter.on("login", lambda user: print(f"환영합니다, {user}!"))
emitter.on("login", lambda user: print(f"로그인 기록: {user}"))
emitter.emit("login", "김철수")
# 환영합니다, 김철수!
# 로그인 기록: 김철수
```

---

### 3-2. Strategy (전략)

**목적**: 알고리즘 군을 정의하고 캡슐화해, 런타임에 **교체 가능**하게 만든다.

**특장점**
- 조건문 분기 대신 다형성으로 알고리즘 선택
- 새로운 전략 추가가 기존 코드에 영향 없음

```python
class SortStrategy(ABC):
    @abstractmethod
    def sort(self, data: list) -> list: ...

class QuickSort(SortStrategy):
    def sort(self, data: list) -> list:
        return sorted(data)  # 간략화

class BubbleSort(SortStrategy):
    def sort(self, data: list) -> list:
        arr = data.copy()
        # 버블 정렬 구현 (간략화)
        return sorted(arr)

class Sorter:
    def __init__(self, strategy: SortStrategy):
        self._strategy = strategy

    def set_strategy(self, strategy: SortStrategy):
        self._strategy = strategy

    def sort(self, data: list) -> list:
        return self._strategy.sort(data)

sorter = Sorter(QuickSort())
sorter.sort([3, 1, 2])

sorter.set_strategy(BubbleSort())  # 런타임 교체
sorter.sort([3, 1, 2])
```

---

### 3-3. Command (커맨드)

**목적**: 요청을 **객체로 캡슐화**해 매개변수화, 큐잉, 로깅, 되돌리기(undo)를 지원한다.

**특장점**
- Undo/Redo 기능 구현의 표준 방법
- 작업을 지연 실행하거나 큐에 적재 가능

```python
class Command(ABC):
    @abstractmethod
    def execute(self): ...
    @abstractmethod
    def undo(self): ...

class TextEditor:
    def __init__(self):
        self.text = ""
        self._history: list[Command] = []

    def execute(self, cmd: Command):
        cmd.execute()
        self._history.append(cmd)

    def undo(self):
        if self._history:
            self._history.pop().undo()

class InsertCommand(Command):
    def __init__(self, editor: TextEditor, text: str):
        self._editor = editor
        self._text = text

    def execute(self):
        self._editor.text += self._text

    def undo(self):
        self._editor.text = self._editor.text[:-len(self._text)]

editor = TextEditor()
editor.execute(InsertCommand(editor, "Hello"))
editor.execute(InsertCommand(editor, " World"))
print(editor.text)  # Hello World
editor.undo()
print(editor.text)  # Hello
```

---

### 3-4. Template Method (템플릿 메서드)

**목적**: 알고리즘의 **골격을 상위 클래스에서 정의**하고, 세부 단계는 서브클래스가 구현한다.

**특장점**
- 공통 흐름을 한 곳에서 관리, 중복 제거
- 훅(Hook) 메서드로 서브클래스에 선택적 확장 포인트 제공

```python
class DataProcessor(ABC):
    def process(self):          # 템플릿 메서드
        data = self.read()
        parsed = self.parse(data)
        self.save(parsed)

    @abstractmethod
    def read(self) -> str: ...

    @abstractmethod
    def parse(self, data: str) -> dict: ...

    def save(self, data: dict):  # 공통 구현 (오버라이드 가능)
        print(f"저장: {data}")

class CSVProcessor(DataProcessor):
    def read(self) -> str:
        return "name,age\nAlice,30"

    def parse(self, data: str) -> dict:
        lines = data.split("\n")
        keys = lines[0].split(",")
        values = lines[1].split(",")
        return dict(zip(keys, values))
```

---

### 3-5. Chain of Responsibility (책임 연쇄)

**목적**: 요청을 처리할 수 있는 핸들러를 찾을 때까지 **체인을 따라 전달**한다.

**특장점**
- 핸들러를 동적으로 추가/제거 가능
- HTTP 미들웨어, 이벤트 버블링의 구현 기반

```python
class Handler(ABC):
    def __init__(self):
        self._next = None

    def set_next(self, handler):
        self._next = handler
        return handler

    def handle(self, request: int):
        if self._next:
            return self._next.handle(request)

class SmallHandler(Handler):
    def handle(self, request: int):
        if request < 10:
            print(f"SmallHandler: {request} 처리")
        else:
            super().handle(request)

class LargeHandler(Handler):
    def handle(self, request: int):
        if request >= 10:
            print(f"LargeHandler: {request} 처리")
        else:
            super().handle(request)

small = SmallHandler()
large = LargeHandler()
small.set_next(large)

small.handle(5)   # SmallHandler: 5 처리
small.handle(15)  # LargeHandler: 15 처리
```

---

## 언제 어떤 패턴을 쓸까?

| 상황 | 추천 패턴 |
|------|-----------|
| 인스턴스를 하나만 유지해야 한다 | Singleton |
| 객체 생성 로직을 바꾸고 싶다 | Factory Method, Abstract Factory |
| 복잡한 객체를 단계별로 만들고 싶다 | Builder |
| 기능을 동적으로 붙였다 뗐다 해야 한다 | Decorator |
| 레거시 인터페이스를 바꾸지 않고 쓰고 싶다 | Adapter |
| 복잡한 내부를 숨기고 싶다 | Facade |
| 상태 변화를 여러 곳에 알려야 한다 | Observer |
| 알고리즘을 런타임에 교체해야 한다 | Strategy |
| Undo/Redo가 필요하다 | Command |
| 공통 흐름은 같고 세부 구현만 다르다 | Template Method |
| 요청을 여러 핸들러 중 하나에게 맡겨야 한다 | Chain of Responsibility |

---

## 패턴을 적용할 때 주의점

1. **패턴이 목적이 아니다** — 문제를 먼저 식별하고, 그 해결책으로 패턴을 선택해야 한다.
2. **과적용(Over-engineering) 주의** — 단순한 코드에 패턴을 억지로 끼워맞추면 오히려 복잡해진다.
3. **패턴 이름은 공통 언어** — 팀 내에서 "여기 Observer 쓰자"라고 말할 수 있는 것이 진짜 가치다.
4. **조합 가능** — Factory + Singleton, Decorator + Composite처럼 패턴은 함께 쓰이는 경우가 많다.

---

## 관련 글

- [[software-architecture-terms|소프트웨어 아키텍처 용어 정리]]
- [[essential-specifications|핵심 소프트웨어 명세 정리]]
