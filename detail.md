# 資格習得のための試験対策アプリ

## 概要
資格試験対策のため、選択式のクイズアプリ 

## 機能概要
- 問題提示
  -  4択のうち1択を選択する。
  - 複数の選択肢を選択する。
- 試験形式
  - 模擬試験形式
    実際の模擬試験のように、問題を提示する。  
    正解数を割合で表示し、何件中何件合格かを記載する。  
    またカテゴリ毎の正解数も表示する。
  - 暗記形式
    単語の暗記等を支援するための問題提示形式  
    模擬試験とは異なり、答えを選択した時点で正解、不正解を表示する。
    その際に解説も表示する。
- 問題形式
出題形式は以下のJSONスキーマとする。
```JSON
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Quiz Data",
  "description": "A list of quiz questions",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": { "type": "integer" },
      "category": { "type": "string" },
      "subCategory": { "type": "string" },
      "description": { "type": "string" },
      "questionType": { "enum": ["single", "multiple"] },
      "difficulty": { "enum": ["easy", "normal", "hard"] },
      "choices": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "id": { "type": "integer" },
            "text": { "type": "string" },
            "imageUrl": { "type": "string" }
          },
          "required": ["id", "text"]
        }
      },
      "answers": {
        "type": "array",
        "items": { "type": "integer" }
      },
      "explanation": { "type": "string" },
      "imageUrl": { "type": "string" },
      "tags": {
        "type": "array",
        "items": { "type": "string" }
      }
    },
    "required": ["id", "category", "description", "questionType", "difficulty", "choices", "answers"]
  }
}
```