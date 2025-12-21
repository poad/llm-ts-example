package com.example.koog_example

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.shared.Agent
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

// データクラス
data class ChatMessage(
  val text: String,
  val isUser: Boolean,
  val timestamp: Long = System.currentTimeMillis()
)

// ViewModel
class ChatViewModel : ViewModel() {
  private val agent = Agent()

  private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
  val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

  private val _isLoading = MutableStateFlow(false)
  val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

  fun sendMessage(userInput: String) {
    if (userInput.isBlank()) return

    _messages.value += ChatMessage(userInput, isUser = true)

    viewModelScope.launch {
      _isLoading.value = true
      try {
        val response = agent.execute(userInput)
        _messages.value += ChatMessage(response, isUser = false)
      } catch (e: Exception) {
        _messages.value += ChatMessage("エラー: ${e.message}", isUser = false)
        e.message?.let { Log.println(Log.ERROR, "", it) }
      } finally {
        _isLoading.value = false
      }
    }
  }
}

// Compose UI
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
  viewModel: ChatViewModel = viewModel()
) {
  val messages by viewModel.messages.collectAsState()
  val isLoading by viewModel.isLoading.collectAsState()
  val listState = rememberLazyListState()
  val coroutineScope = rememberCoroutineScope()

  // 新しいメッセージが追加されたら自動スクロール
  LaunchedEffect(messages.size) {
    if (messages.isNotEmpty()) {
      coroutineScope.launch {
        listState.animateScrollToItem(messages.size - 1)
      }
    }
  }

  Scaffold(
    topBar = {
      TopAppBar(
        title = { Text("チャットエージェント") },
        colors = TopAppBarDefaults.topAppBarColors(
          containerColor = MaterialTheme.colorScheme.primary,
          titleContentColor = Color.White
        )
      )
    },
    bottomBar = {
      // 入力欄をbottomBarに配置
      ChatInputField(
        onSendMessage = { viewModel.sendMessage(it) },
        enabled = !isLoading
      )
    },
    containerColor = Color(0xFFF5F5F5)
  ) { innerPadding ->
    // メッセージリスト
    LazyColumn(
      state = listState,
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding),
      contentPadding = PaddingValues(16.dp),
      verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      items(messages) { message ->
        ChatMessageItem(message)
      }

      // ローディング表示
      if (isLoading) {
        item {
          LoadingIndicator()
        }
      }
    }
  }
}

@Composable
fun ChatMessageItem(message: ChatMessage) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = if (message.isUser) Arrangement.End else Arrangement.Start
  ) {
    Card(
      modifier = Modifier.widthIn(max = 280.dp),
      colors = CardDefaults.cardColors(
        containerColor = if (message.isUser) {
          MaterialTheme.colorScheme.primary
        } else {
          Color.White
        }
      ),
      elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
      Text(
        text = message.text,
        modifier = Modifier.padding(12.dp),
        color = if (message.isUser) Color.White else Color.Black
      )
    }
  }
}

@Composable
fun LoadingIndicator() {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.Start
  ) {
    Card(
      colors = CardDefaults.cardColors(containerColor = Color.White),
      elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
      Row(
        modifier = Modifier.padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        CircularProgressIndicator(
          modifier = Modifier.size(16.dp),
          strokeWidth = 2.dp
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text("処理中...", fontSize = 14.sp)
      }
    }
  }
}

@Composable
fun ChatInputField(
  onSendMessage: (String) -> Unit,
  enabled: Boolean
) {
  var text by remember { mutableStateOf("") }

  Surface(
    shadowElevation = 8.dp,
    color = Color.White,
    modifier = Modifier.padding(bottom = 48.dp) // 下にマージンを追加して上に移動
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 12.dp, vertical = 8.dp),
      verticalAlignment = Alignment.Bottom
    ) {
      OutlinedTextField(
        value = text,
        onValueChange = { text = it },
        modifier = Modifier.weight(1f),
        placeholder = { Text("メッセージを入力...", fontSize = 14.sp) },
        enabled = enabled,
        maxLines = 3,
        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 14.sp),
        shape = RoundedCornerShape(24.dp),
        colors = OutlinedTextFieldDefaults.colors(
          focusedBorderColor = MaterialTheme.colorScheme.primary,
          unfocusedBorderColor = Color.LightGray
        )
      )

      Spacer(modifier = Modifier.width(8.dp))

      IconButton(
        onClick = {
          if (text.isNotBlank()) {
            onSendMessage(text)
            text = ""
          }
        },
        enabled = enabled && text.isNotBlank(),
        modifier = Modifier
          .size(40.dp)
          .padding(bottom = 16.dp) // 下にマージンを追加して上に移動
      ) {
        Icon(
          imageVector = Icons.AutoMirrored.Filled.Send,
          contentDescription = "送信",
          tint = if (enabled && text.isNotBlank()) {
            MaterialTheme.colorScheme.primary
          } else {
            Color.Gray
          }
        )
      }
    }
  }
}

// Activity での使用例
class ChatActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    setContent {
      MaterialTheme {
        ChatScreen()
      }
    }
  }
}

@Preview
@Composable
fun AppAndroidPreview() {
  ChatActivity()
}
