import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/01-common/lib/supabase';
import { useToast } from '@/01-common/hooks/useToast';
import LoadingSpinner from '@/01-common/components/LoadingSpinner';
import { Button } from '@/core/components/ui/button';
import { Textarea } from '@/core/components/ui/textarea';
import { Send } from 'lucide-react';

const RelatoComments = ({ relatoId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null); // Novo estado para o ID do usuário logado
  const [canDeleteAnyComment, setCanDeleteAnyComment] = useState(false); // Novo estado para permissão de apagar qualquer comentário
  const { showToast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      // Busca a permissão can_delete_any_comment do perfil do usuário
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('can_delete_any_comment')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar permissão de exclusão:', error);
        } else if (profile) {
          setCanDeleteAnyComment(profile.can_delete_any_comment);
        }
      }
    };
    fetchUser();
  }, []);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('relato_comentarios')
      .select(`
        *,
        profiles(full_name, email)
      `)
      .eq('relato_id', relatoId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar comentários:', error);
      showToast('Erro ao carregar comentários.', 'error');
    } else {
      setComments(data);
    }
    setLoading(false);
  }, [relatoId, showToast]);

  useEffect(() => {
    fetchComments();

    const subscription = supabase
      .channel(`relato_comments:${relatoId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'relato_comentarios', filter: `relato_id=eq.${relatoId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setComments((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'DELETE') {
            console.log('Realtime DELETE event received:', payload);
            console.log('Deleting comment with ID:', payload.old.id);
            setComments((prev) => prev.filter((comment) => comment.id !== payload.old.id));
          } // UPDATE events could be handled here too if comments are editable
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [relatoId, fetchComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      showToast('O comentário não pode estar vazio.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast('Você precisa estar logado para comentar.', 'error');
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from('relato_comentarios').insert({
        relato_id: relatoId,
        user_id: user.id,
        comment_text: newComment.trim()
      });

      if (error) {
        console.error('Erro ao enviar comentário:', error);
        showToast(`Erro ao enviar comentário: ${error.message}`, 'error');
      } else {
        setNewComment('');
        showToast('Comentário enviado!', 'success');
      }
    } catch (error) {
      console.error('Erro inesperado ao enviar comentário:', error);
      showToast('Erro inesperado ao enviar comentário.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Tem certeza que deseja excluir este comentário?')) {
      return;
    }
    setSubmitting(true); // Usar o mesmo estado de submitting para desabilitar o botão de enviar
    try {
      const { error } = await supabase
        .from('relato_comentarios')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Erro ao excluir comentário:', error);
        showToast(`Erro ao excluir comentário: ${error.message}`, 'error');
      } else {
        showToast('Comentário excluído com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro inesperado ao excluir comentário:', error);
      showToast('Erro inesperado ao excluir comentário.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mt-8 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Comentários</h2>
      <form onSubmit={handleSubmitComment} className="relative mb-6">
        <Textarea
          placeholder="Adicione um comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows="3"
          disabled={submitting}
          className="pr-10 resize-none"
        />
        <Button
          type="submit"
          size="icon"
          disabled={submitting || !newComment.trim()}
          className="absolute bottom-2 right-2"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-600">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-800">{comment.comment_text}</p>
              <p className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                <span>
                  Por {comment.profiles?.full_name || comment.profiles?.email || 'Usuário Desconhecido'} em {new Date(comment.created_at).toLocaleString()}
                </span>
                { (comment.user_id === currentUserId || canDeleteAnyComment) && (
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(comment.id)}>
                    Excluir
                  </Button>
                )}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RelatoComments;
