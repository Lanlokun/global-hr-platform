import { useEffect, useMemo, useRef, useState } from "react";
import {
  MessageCircle,
  Search,
  Send,
  RefreshCw,
  UserCircle2,
  Briefcase,
  Clock,
  Inbox,
} from "lucide-react";

import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/Button";
import { useLanguage } from "../../context/LanguageContext";

function Messages() {
  const { t } = useLanguage();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const getOtherPerson = (conversation) => {
    if (!conversation) return {};

    if (currentUser.role === "candidate") {
      return {
        name: conversation.employer_name,
        email: conversation.employer_email,
        image: conversation.employer_image,
      };
    }

    return {
      name: conversation.candidate_name,
      email: conversation.candidate_email,
      image: conversation.candidate_image,
    };
  };

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return conversations;

    return conversations.filter((conversation) => {
      const other = getOtherPerson(conversation);

      return (
        other.name?.toLowerCase().includes(q) ||
        other.email?.toLowerCase().includes(q) ||
        conversation.job_title?.toLowerCase().includes(q) ||
        conversation.last_message?.toLowerCase().includes(q)
      );
    });
  }, [conversations, search]);

  const unreadTotal = conversations.reduce(
    (sum, item) => sum + Number(item.unread_count || 0),
    0
  );

  const activePerson = getOtherPerson(activeConversation);

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);

      const res = await api.get("/api/messages/conversations");
      const data = res.data || [];

      setConversations(data);

      if (!activeConversation && data.length > 0) {
        setActiveConversation(data[0]);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversation) => {
    if (!conversation) return;

    try {
      setLoadingMessages(true);

      const res = await api.get(`/api/messages/conversations/${conversation.id}`);
      setMessages(res.data || []);

      await api.patch(`/api/messages/conversations/${conversation.id}/read`);
      await fetchConversations();
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMessages(activeConversation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConversation?.id]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!body.trim() || !activeConversation || sending) return;

    try {
      setSending(true);

      await api.post(`/api/messages/conversations/${activeConversation.id}`, {
        body: body.trim(),
      });

      setBody("");
      await fetchMessages(activeConversation);
      await fetchConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
      alert(error.response?.data?.error || t("messagesPage.errors.send"));
    } finally {
      setSending(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      sendMessage(e);
    }
  };

  return (
    <DashboardLayout
      title={t("messagesPage.title")}
      subtitle={t("messagesPage.subtitle")}
    >
      <div style={pageShellStyle}>
        <div style={summaryBarStyle}>
          <div style={summaryItemStyle}>
            <MessageCircle size={18} />
            <strong>{conversations.length}</strong>
            <span>{t("messagesPage.conversations")}</span>
          </div>

          <div style={summaryItemStyle}>
            <Inbox size={18} />
            <strong>{unreadTotal}</strong>
            <span>{t("messagesPage.unread")}</span>
          </div>

          <button
            type="button"
            style={refreshButtonStyle}
            onClick={fetchConversations}
          >
            <RefreshCw size={16} />
            {t("messagesPage.refresh")}
          </button>
        </div>

        <div style={layoutStyle}>
          <aside style={sidebarStyle}>
            <div style={sidebarHeaderStyle}>
              <div>
                <h3 style={panelTitleStyle}>{t("messagesPage.conversations")}</h3>
                <p style={panelSubtitleStyle}>
                  {t("messagesPage.conversationsSubtitle")}
                </p>
              </div>
            </div>

            <div style={searchBoxStyle}>
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("messagesPage.searchPlaceholder")}
                style={searchInputStyle}
              />
            </div>

            <div style={conversationListStyle}>
              {loadingConversations ? (
                <EmptyState
                  icon={<RefreshCw size={32} />}
                  title={t("messagesPage.loading")}
                />
              ) : filteredConversations.length === 0 ? (
                <EmptyState
                  icon={<Inbox size={34} />}
                  title={t("messagesPage.empty")}
                  text={t("messagesPage.emptyHint")}
                />
              ) : (
                filteredConversations.map((conversation) => {
                  const other = getOtherPerson(conversation);
                  const active = activeConversation?.id === conversation.id;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      style={{
                        ...conversationItemStyle,
                        ...(active ? activeConversationStyle : {}),
                      }}
                      onClick={() => setActiveConversation(conversation)}
                    >
                      <Avatar name={other.name || other.email} image={other.image} />

                      <div style={conversationBodyStyle}>
                        <div style={conversationTopLineStyle}>
                          <strong style={conversationNameStyle}>
                            {other.name ||
                              other.email ||
                              t("messagesPage.unknownUser")}
                          </strong>

                          <span style={conversationTimeStyle}>
                            {formatShortDate(conversation.last_message_at)}
                          </span>
                        </div>

                        <div style={conversationMetaStyle}>
                          <Briefcase size={13} />
                          <span>
                            {conversation.job_title ||
                              t("messagesPage.generalChat")}
                          </span>
                        </div>

                        <div style={conversationPreviewStyle}>
                          {conversation.last_message ||
                            t("messagesPage.noMessagesYet")}
                        </div>
                      </div>

                      {conversation.unread_count > 0 && (
                        <span style={unreadBadgeStyle}>
                          {conversation.unread_count}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section style={chatPanelStyle}>
            {!activeConversation ? (
              <div style={emptyChatStyle}>
                <EmptyState
                  icon={<MessageCircle size={44} />}
                  title={t("messagesPage.selectConversation")}
                  text={t("messagesPage.selectConversationHint")}
                />
              </div>
            ) : (
              <>
                <div style={chatHeaderStyle}>
                  <div style={chatHeaderLeftStyle}>
                    <Avatar
                      name={activePerson.name || activePerson.email}
                      image={activePerson.image}
                      large
                    />

                    <div>
                      <h3 style={chatTitleStyle}>
                        {activePerson.name ||
                          activePerson.email ||
                          t("messagesPage.conversation")}
                      </h3>

                      <p style={chatSubtitleStyle}>
                        {activeConversation.job_title ||
                          t("messagesPage.generalChat")}
                      </p>
                    </div>
                  </div>

                  <div style={chatHeaderMetaStyle}>
                    <Clock size={14} />
                    {formatShortDate(activeConversation.last_message_at)}
                  </div>
                </div>

                <div style={messagesBoxStyle}>
                  {loadingMessages ? (
                    <EmptyState
                      icon={<RefreshCw size={32} />}
                      title={t("messagesPage.loading")}
                    />
                  ) : messages.length === 0 ? (
                    <EmptyState
                      icon={<MessageCircle size={38} />}
                      title={t("messagesPage.noMessagesYet")}
                      text={t("messagesPage.noMessagesHint")}
                    />
                  ) : (
                    messages.map((message) => {
                      const mine =
                        Number(message.sender_id) === Number(currentUser.id);

                      return (
                        <div
                          key={message.id}
                          style={{
                            ...messageRowStyle,
                            justifyContent: mine ? "flex-end" : "flex-start",
                          }}
                        >
                          {!mine && (
                            <Avatar
                              name={message.sender_name || activePerson.name}
                              image={message.sender_image}
                              small
                            />
                          )}

                          <div
                            style={{
                              ...messageBubbleStyle,
                              ...(mine ? myBubbleStyle : theirBubbleStyle),
                            }}
                          >
                            <div style={messageTextStyle}>{message.body}</div>

                            <div
                              style={{
                                ...messageTimeStyle,
                                textAlign: mine ? "right" : "left",
                              }}
                            >
                              {formatDateTime(message.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendMessage} style={composerStyle}>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder={t("messagesPage.placeholder")}
                    style={textareaStyle}
                    rows={1}
                  />

                  <Button type="submit" disabled={!body.trim() || sending}>
                    <Send size={16} />
                    {sending ? t("messagesPage.sending") : t("messagesPage.send")}
                  </Button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Avatar({ name, image, large = false, small = false }) {
  const size = large ? 52 : small ? 34 : 44;

  if (image) {
    return (
      <img
        src={image}
        alt={name || "User"}
        style={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: large ? 18 : 14,
          objectFit: "cover",
          border: "1px solid #e2e8f0",
        }}
      />
    );
  }

  return (
    <div
      style={{
        ...avatarStyle,
        width: size,
        height: size,
        minWidth: size,
        borderRadius: large ? 18 : 14,
        fontSize: large ? 18 : small ? 13 : 15,
      }}
    >
      {(name || "U").charAt(0).toUpperCase()}
    </div>
  );
}

function EmptyState({ icon, title, text }) {
  return (
    <div style={emptyStateStyle}>
      <div style={emptyIconStyle}>{icon}</div>
      <strong>{title}</strong>
      {text && <p>{text}</p>}
    </div>
  );
}

function formatDateTime(date) {
  if (!date) return "";

  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const pageShellStyle = {
  display: "grid",
  gap: "18px",
};

const summaryBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  padding: "14px 16px",
  borderRadius: "20px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.05)",
};

const summaryItemStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  color: "#475569",
  fontSize: "14px",
};

const refreshButtonStyle = {
  border: "1px solid #dbe3ef",
  background: "#f8fafc",
  color: "#0f172a",
  borderRadius: "999px",
  padding: "9px 13px",
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
  cursor: "pointer",
  fontWeight: 800,
};

const layoutStyle = {
  display: "grid",
  gridTemplateColumns: "370px minmax(0, 1fr)",
  gap: "20px",
  alignItems: "stretch",
};

const sidebarStyle = {
  height: "680px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "24px",
  overflow: "hidden",
  boxShadow: "0 16px 38px rgba(15, 23, 42, 0.06)",
  display: "flex",
  flexDirection: "column",
};

const sidebarHeaderStyle = {
  padding: "20px 20px 14px",
  borderBottom: "1px solid #eef2f7",
};

const panelTitleStyle = {
  margin: 0,
  fontSize: "18px",
  color: "#0f172a",
};

const panelSubtitleStyle = {
  margin: "5px 0 0",
  fontSize: "13px",
  color: "#64748b",
};

const searchBoxStyle = {
  margin: "14px",
  padding: "0 12px",
  borderRadius: "14px",
  border: "1px solid #dbe3ef",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "#f8fafc",
};

const searchInputStyle = {
  width: "100%",
  border: "none",
  outline: "none",
  background: "transparent",
  padding: "12px 0",
  fontSize: "14px",
};

const conversationListStyle = {
  display: "grid",
  gap: "10px",
  padding: "0 14px 14px",
  overflowY: "auto",
};

const conversationItemStyle = {
  width: "100%",
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  borderRadius: "18px",
  padding: "13px",
  textAlign: "left",
  cursor: "pointer",
  display: "flex",
  alignItems: "flex-start",
  gap: "11px",
  position: "relative",
  transition: "all 0.2s ease",
};

const activeConversationStyle = {
  borderColor: "#2563eb",
  background: "#eff6ff",
  boxShadow: "0 10px 25px rgba(37, 99, 235, 0.12)",
};

const conversationBodyStyle = {
  minWidth: 0,
  flex: 1,
};

const conversationTopLineStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "8px",
  alignItems: "center",
};

const conversationNameStyle = {
  color: "#0f172a",
  fontSize: "14px",
  fontWeight: 900,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const conversationTimeStyle = {
  fontSize: "11px",
  color: "#94a3b8",
  whiteSpace: "nowrap",
};

const conversationMetaStyle = {
  marginTop: "4px",
  fontSize: "12px",
  color: "#64748b",
  display: "flex",
  alignItems: "center",
  gap: "5px",
};

const conversationPreviewStyle = {
  marginTop: "7px",
  fontSize: "12px",
  color: "#94a3b8",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const unreadBadgeStyle = {
  minWidth: "22px",
  height: "22px",
  borderRadius: "999px",
  background: "#dc2626",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: 900,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  right: "10px",
  bottom: "10px",
};

const chatPanelStyle = {
  height: "680px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "24px",
  overflow: "hidden",
  boxShadow: "0 16px 38px rgba(15, 23, 42, 0.06)",
  display: "flex",
  flexDirection: "column",
};

const chatHeaderStyle = {
  padding: "18px 20px",
  borderBottom: "1px solid #eef2f7",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
};

const chatHeaderLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: "13px",
  minWidth: 0,
};

const chatTitleStyle = {
  margin: 0,
  fontSize: "18px",
  color: "#0f172a",
};

const chatSubtitleStyle = {
  margin: "4px 0 0",
  fontSize: "13px",
  color: "#64748b",
};

const chatHeaderMetaStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  color: "#94a3b8",
  fontSize: "12px",
};

const messagesBoxStyle = {
  flex: 1,
  overflowY: "auto",
  background:
    "linear-gradient(180deg, #f8fafc 0%, #ffffff 55%, #f8fafc 100%)",
  padding: "20px",
  display: "grid",
  alignContent: "start",
  gap: "13px",
};

const messageRowStyle = {
  display: "flex",
  gap: "8px",
  alignItems: "flex-end",
};

const messageBubbleStyle = {
  maxWidth: "68%",
  padding: "12px 14px",
  borderRadius: "18px",
  fontSize: "14px",
  lineHeight: 1.6,
  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
};

const myBubbleStyle = {
  background: "#2563eb",
  color: "#ffffff",
  borderBottomRightRadius: "5px",
};

const theirBubbleStyle = {
  background: "#ffffff",
  color: "#0f172a",
  border: "1px solid #e2e8f0",
  borderBottomLeftRadius: "5px",
};

const messageTextStyle = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const messageTimeStyle = {
  marginTop: "7px",
  fontSize: "11px",
  opacity: 0.72,
};

const composerStyle = {
  padding: "14px",
  borderTop: "1px solid #eef2f7",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "10px",
  alignItems: "end",
  background: "#ffffff",
};

const textareaStyle = {
  width: "100%",
  minHeight: "46px",
  maxHeight: "120px",
  padding: "12px 14px",
  border: "1px solid #dbe3ef",
  borderRadius: "16px",
  fontSize: "14px",
  outline: "none",
  background: "#f8fafc",
  resize: "vertical",
  lineHeight: 1.5,
};

const emptyChatStyle = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f8fafc",
};

const emptyStateStyle = {
  padding: "30px",
  textAlign: "center",
  color: "#64748b",
  display: "grid",
  justifyItems: "center",
  gap: "8px",
};

const emptyIconStyle = {
  width: "62px",
  height: "62px",
  borderRadius: "22px",
  background: "#eff6ff",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "6px",
};

const avatarStyle = {
  background: "linear-gradient(135deg, #0f172a, #2563eb)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
};

export default Messages;